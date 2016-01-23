
'use strict';

var https = require("https"),
    util = require('util'),
    EventEmitter = require('events'),
    PetitionLoader = require('./petition-loader'),
    PetitionPageLoader = require('./petition-page-loader'),
    Latch = require('./latch'),
    LoaderExecutor = require('./loader-executor'),
    petitionUtil = require('./petition-util'),
    equal = require('deep-equal'),
    EnrichedPetition = require('./enriched-petition');

var forwardError = petitionUtil.forwardError;

/**
 * Configuration for PetitionPager.
 * @typedef {object} PetitionPager~Config
 * @property {number} loadInterval - The interval.
 * @property {boolean} debug - If debug logging should be enabled.
 * @property {boolean} loadDetail - If detailed petition information should be loaded.
 * @property {function} transformer - A function to transform the petitions before stored or emitted.
 */

/**
 * Loads all the petition data according to a filter.
 * @constructor
 * @param {PetitionPager~Config} config - Configuration for PetitionsMonitor.
 */
function PetitionPager(config) {
    EventEmitter.call(this);
    var loadInterval = 500,
        debug = function() {},
        loadDetail = false,
        transformer = function (raw) {
            return petitionUtil.recursiveFreeze(new EnrichedPetition(raw));
        };
    if (config) {
        if (config.loadInterval) {
            loadInterval = config.loadInterval;
        }
        if (config.debug) {
            debug = function() {
                console.log.apply(null, arguments);
            };
        }
        if (config.loadDetail !== undefined) {
            loadDetail = config.loadDetail;
        }
        if (config.transformer) {
            transformer = function (data) {
                return petitionUtil.recursiveFreeze(config.transformer(data));
            };
        }
    }

    var self = this,
        agent = new https.Agent({ keepAlive: true, maxSockets: 1 }),
        petitionLoader = new PetitionLoader(),
        pageLoader = new PetitionPageLoader(),
        executor = new LoaderExecutor(loadInterval),
        setPetitionData = function (data) {
            var oldData = self.petitions[data.id];
            var transformedData = transformer(data);

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
            var transformedData = transformer(data);

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
                        debug('Error loading petition detail for \'%s\'', action);
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
     * The petitions.
     */
    this.petitions = {
        length: 0
    };
    /**
     * Change the interval between loading pages.
     */
    this.setPageLoadInterval = function(newInterval) {
        loadInterval = newInterval;
        executor.setInterval(newInterval);
        return self;
    };

    var internalLoadPage = function(page, emitter, accepter, remover) {
        var summaryHandlerProvider = function(latch) {
            return function(summary) {
                if (remover && remover(summary, self.petitions)) {
                    if (!loadDetail) {
                        debug('Petition \'%s\' removed', summary.attributes.action);
                        removePetitionData(summary);
                        latch.release();
                    }
                    else {
                        detailLoader(summary.id, summary.attributes.action, latch, function(data) {
                            debug('Petition \'%s\' detail stored', summary.attributes.action);
                            removePetitionData(data);
                        });
                    }
                    return;
                }

                if (accepter && !accepter(summary, self.petitions)) {
                    // Skip
                    debug('Petition \'%s\' filtered', summary.attributes.action);
                    latch.release();
                    return;
                }

                if (!loadDetail) {
                    // Store summary data
                    debug('Petition \'%s\' summary stored', summary.attributes.action);
                    setPetitionData(summary);
                    latch.release();
                    return;
                }

                detailLoader(summary.id, summary.attributes.action, latch, function(data) {
                    debug('Petition \'%s\' detail stored', summary.attributes.action);
                    setPetitionData(data);
                });
            };
        };

        var onPageLoaded = function(summary) {
            var latch = new Latch(summary.data.length);
            latch.onRelease(function () {
                debug('Page \'%s\' loaded', page);
                emitter.emit('page-loaded', summary);
            });
            summary.data.forEach(summaryHandlerProvider(latch));
        };

        executor.execute(function() {
            debug('Loading page \'%s\'', page);
            pageLoader
                .load(page)
                .onLoaded(onPageLoaded)
                .onError(forwardError(self));
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
