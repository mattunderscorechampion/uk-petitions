
'use strict';

var https = require("https"),
    util = require('util'),
    EventEmitter = require('events'),
    PetitionLoader = require('./petition-loader'),
    PetitionPageLoader = require('./petition-page-loader'),
    Latch = require('./latch'),
    LoaderExecutor = require('./loader-executor'),
    petitionUtil = require('./petition-util'),
    equal = require('deep-equal');

var forwardError = petitionUtil.forwardError;

/**
 * Loads all the petition data according to a filter.
 * @constructor
 */
function PetitionPager(config) {
    EventEmitter.call(this);
    var loadInterval = 500;
    var debug = function() {};
    var loadDetail = true;
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
    }

    var self = this,
        agent = new https.Agent({ keepAlive: true, maxSockets: 1 }),
        petitionLoader = new PetitionLoader(),
        pageLoader = new PetitionPageLoader(),
        executor = new LoaderExecutor(loadInterval),
        setPetitionData = function (data) {
            var oldData = self.petitions[data.id];
            if (oldData) {
                // Replace with changed data
                if (!equal(oldData, data)) {
                    self.petitions[data.id] = data;
                    self.emit('petition', data, oldData);
                }
            } else {
                // Add new data
                self.petitions[data.id] = data;
                self.petitions.length = self.petitions.length + 1;
                self.emit('petition', data);
            }
        };
    this.petitions = {
        length: 0
    };
    this.setPageLoadInterval = function(newInterval) {
        loadInterval = newInterval;
        executor.setInterval(newInterval);
        return self;
    };

    var internalLoadPage = function(page, emitter, accepter) {
        var summaryHandlerProvider = function(latch) {
            return function(summary) {
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

                // Schedule task for loading petition detail
                executor.execute(function() {
                    petitionLoader
                        .load(summary.id)
                        .on('error', function (error) {
                            debug('Error loading petition detail for \'%s\'', summary.attributes.action);
                            self.emit('error', error);
                            latch.release();
                        })
                        .on('loaded', function (data) {
                            debug('Petition \'%s\' detail stored', summary.attributes.action);
                            setPetitionData(data);
                            latch.release();
                        });
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
                .on('loaded', onPageLoaded)
                .on('error', forwardError(self));
        });
    };

    this.populateAll = function () {
        return self.populate(function() {
            return true;
        });
    };

    this.populateOpen = function () {
        return self.populate(function(summary) {
            return summary.attributes.state === 'open';
        });
    };

    this.populateInteresting = function () {
        return self.populate(function(summary) {
            return summary.attributes.state !== 'rejected' && summary.attributes.state !== 'closed';
        });
    };

    this.populateHot = function () {
        var emitter = new EventEmitter();
        emitter.on('page-loaded', function() {
            self.emit('loaded', self);
        });
        internalLoadPage(1, emitter);
        return self;
    };

    this.populate = function (accepter) {
        var emitter = new EventEmitter();

        // Load the next page
        var loadNextPage = function (data) {
            if (data.links.next !== null) {
                var index = data.links.next.lastIndexOf('/'),
                    nextPath = data.links.next.substring(index);
                    internalLoadPage(nextPath, emitter, accepter);
            }
            else {
                self.emit('loaded', self);
            }
        };

        emitter.on('page-loaded', loadNextPage);
        internalLoadPage('/petitions.json?page=1&state=all', emitter, accepter);

        return self;
    };
}
util.inherits(PetitionPager, EventEmitter);

module.exports = PetitionPager;
