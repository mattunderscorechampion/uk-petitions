
'use strict';

var https = require("https"),
    util = require('util'),
    EventEmitter = require('events'),
    PetitionLoader = require('./petition-loader'),
    PetitionPageLoader = require('./petition-page-loader'),
    Latch = require('../target/js/latch').Latch,
    LoaderExecutor = require('./loader-executor'),
    petitionUtil = require('./petition-util'),
    equal = require('deep-equal'),
    EnrichedPetition = require('../target/js/enriched-petition').EnrichedPetition;

/**
 * Private constructor for petition pager config.
 * @constructor
 * @classdesc Configuration for PetitionPager.
 * @property {number} loadInterval - The interval.
 * @property {boolean} debug - If debug logging should be enabled.
 * @property {boolean} loadDetail - If detailed petition information should be loaded.
 * @property {function} transformer - A function to transform the petitions before stored or emitted.
 */
function PetitionPagerConfig(config) {
    this.loadInterval = 500;
    this.debug = function() {};
    this.loadDetail = false;
    this.transformer = function (raw) {
        return petitionUtil.recursiveFreeze(new EnrichedPetition(raw));
    };

    if (config) {
        if (config.loadInterval) {
            this.loadInterval = config.loadInterval;
        }
        if (config.debug) {
            this.debug = function() {
                console.log.apply(null, arguments);
            };
        }
        if (config.loadDetail !== undefined) {
            this.loadDetail = config.loadDetail;
        }
        if (config.transformer) {
            this.transformer = function (data) {
                return petitionUtil.recursiveFreeze(config.transformer(data));
            };
        }
    }
}

/**
 * Constructor for petition pager.
 * @constructor
 * @param {PetitionPagerConfig} config - Configuration for PetitionsMonitor.
 * @classdesc Loads all the petition data according to a filter.
 * @augments EventEmitter
 */
function PetitionPager(config) {
    EventEmitter.call(this);
    var conf = new PetitionPagerConfig(config);

    var self = this,
        agent = new https.Agent({ keepAlive: true, maxSockets: 1 }),
        petitionLoader = new PetitionLoader(),
        pageLoader = new PetitionPageLoader(),
        executor = new LoaderExecutor(conf.loadInterval),
        setPetitionData = function (data) {
            var oldData = self.petitions[data.id];
            var transformedData = conf.transformer(data);

            if (!transformedData) {
                self.emit('error', new Error('Failed to transform the petition data'));
                return;
            }

            if (oldData) {
                // Replace with changed data
                if (!equal(oldData, transformedData)) {
                    self.petitions[data.id] = transformedData;
                    self.emit('petition', transformedData, oldData);
                }
            } else {
                // Add new data
                self.petitions[data.id] = transformedData;
                self.petitions.length = self.petitions.length + 1;
                self.emit('petition', transformedData);
            }
        },
        removePetitionData = function (data) {
            var oldData = self.petitions[data.id];
            var transformedData = conf.transformer(data);

            if (!transformedData) {
                self.emit('error', new Error('Failed to transform the petition data'));
                return;
            }

            if (oldData) {
                delete self.petitions[data.id];
                self.emit('removed-petition', transformedData, oldData);
            }
        },
        detailLoader = function (id, action, latch, onSuccess) {
            // Schedule task for loading petition detail
            executor.execute(function() {
                petitionLoader
                    .load(id)
                    .onError(function (error) {
                        config.debug('Error loading petition detail for \'%s\'', action);
                        self.emit('error', error);
                        latch.release();
                    })
                    .onLoaded(function (data) {
                        onSuccess(data);
                        latch.release();
                    });
            });
        };

    /**
     * The petitions map. Maps from petition ID to petition object. Also has
     * length property.
     * @member {object}
     */
    this.petitions = {
        length: 0
    };
    /**
     * Change the interval between loading pages.
     * @function
     * @param {number} newInterval - The new interval
     * @return {PetitionPager} - Self
     */
    this.setPageLoadInterval = function(newInterval) {
        config.loadInterval = newInterval;
        executor.setInterval(newInterval);
        return self;
    };

    var internalLoadPage = function(page, emitter, accepter, remover) {
        var summaryHandlerProvider = function(latch) {
            return function(summary) {
                if (remover && remover(summary, self.petitions)) {
                    if (!conf.loadDetail) {
                        conf.debug('Petition \'%s\' removed', summary.attributes.action);
                        removePetitionData(summary);
                        latch.release();
                    }
                    else {
                        detailLoader(summary.id, summary.attributes.action, latch, function(data) {
                            conf.debug('Petition \'%s\' detail stored', summary.attributes.action);
                            removePetitionData(data);
                        });
                    }
                    return;
                }

                if (accepter && !accepter(summary, self.petitions)) {
                    // Skip
                    conf.debug('Petition \'%s\' filtered', summary.attributes.action);
                    latch.release();
                    return;
                }

                if (!conf.loadDetail) {
                    // Store summary data
                    conf.debug('Petition \'%s\' summary stored', summary.attributes.action);
                    setPetitionData(summary);
                    latch.release();
                    return;
                }

                detailLoader(summary.id, summary.attributes.action, latch, function(data) {
                    conf.debug('Petition \'%s\' detail stored', summary.attributes.action);
                    setPetitionData(data);
                });
            };
        };

        var onPageLoaded = function(summary) {
            var latch = new Latch(summary.data.length);
            latch.onRelease(function () {
                conf.debug('Page \'%s\' loaded', page);
                emitter.emit('page-loaded', summary);
            });
            summary.data.forEach(summaryHandlerProvider(latch));
        };

        executor.execute(function() {
            conf.debug('Loading page \'%s\'', page);
            pageLoader
                .load(page)
                .onLoaded(onPageLoaded)
                .onError(self.emit.bind(self, 'error'));
        });
    };

    /**
     * Load petitions without specifying a state.
     * @return {PetitionPager} - Self
     */
    this.populateHot = function () {
        var emitter = new EventEmitter();
        emitter.on('page-loaded', function() {
            self.emit('loaded', self);
        });
        internalLoadPage(1, emitter);
        return self;
    };

    /**
     * Load all petitions.
     * @param {function} accepter - A predicate to test if a petition should be accepted.
     * @param {function} remover - A predicate to test if a petition should be removed.
     * @return {PetitionPager} - Self
     */
    this.populate = function (accepter, remover) {
        var emitter = new EventEmitter();

        // Load the next page
        var loadNextPage = function (data) {
            if (data.links.next !== null) {
                var index = data.links.next.lastIndexOf('/'),
                    nextPath = data.links.next.substring(index);
                    internalLoadPage(nextPath, emitter, accepter, remover);
            }
            else {
                self.emit('loaded', self);
            }
        };

        emitter.on('page-loaded', loadNextPage);
        internalLoadPage('/petitions.json?page=1&state=all', emitter, accepter, remover);

        return self;
    };
}
util.inherits(PetitionPager, EventEmitter);

module.exports = PetitionPager;
