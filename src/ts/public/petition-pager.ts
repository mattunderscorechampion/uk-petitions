

/// <reference path="../node.d.ts" />

import latch = require('../private/latch');
import petitionUtil = require('../private/petition-util');
import util = require('util');
import https = require("https");
import events = require('events');
import loaderExecutor = require('../private/loader-executor');
import equal = require('deep-equal');

import loading = require('./loading');
import petitionLoader = require('./petition-loader');
import petitionPageLoader = require('./petition-page-loader');
import enrichedPetition = require('./enriched-petition');

/// <reference path="./loading.ts" />
/// <reference path="./petition-loader.ts" />
/// <reference path="./petition-page-loader.ts" />
/// <reference path="./enriched-petition.ts" />

export module UkPetitions {

/**
 * Private constructor for petition pager config.
 * @constructor
 * @classdesc Configuration for PetitionPager.
 * @property {number} loadInterval - The interval.
 * @property {boolean} debug - If debug logging should be enabled.
 * @property {boolean} loadDetail - If detailed petition information should be loaded.
 * @property {function} transformer - A function to transform the petitions before stored or emitted.
 */
export class PetitionPagerConfig {
    loadInterval = 500;
    debug = function(message: string, ...objects: any[]) {};
    loadDetail = false;
    transformer = function (raw) {
        return petitionUtil.recursiveFreeze(new enrichedPetition.UkPetitions.EnrichedPetition(raw));
    };

    constructor(config: any) {
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
}

/**
 * Constructor for petition pager.
 * @constructor
 * @param {PetitionPagerConfig} config - Configuration for PetitionsMonitor.
 * @classdesc Loads all the petition data according to a filter.
 * @augments EventEmitter
 */
export class PetitionPager extends events.EventEmitter {
    private conf: PetitionPagerConfig;
    private agent: https.Agent = new https.Agent({ keepAlive: true, maxSockets: 1 });
    private petitionLoader: petitionLoader.UkPetitions.PetitionLoader = new petitionLoader.UkPetitions.PetitionLoader();
    private pageLoader: petitionPageLoader.UkPetitions.PetitionPageLoader = new petitionPageLoader.UkPetitions.PetitionPageLoader();
    private executor: loaderExecutor.LoaderExecutor;

    constructor(config: any) {
        super();
        this.conf = new PetitionPagerConfig(config);
        this.executor = new loaderExecutor.LoaderExecutor(this.conf.loadInterval);
    }

    private setPetitionData(data) {
        var oldData = this.petitions[data.id];
        var transformedData = this.conf.transformer(data);

        if (!transformedData) {
            this.emit('error', new Error('Failed to transform the petition data'));
            return;
        }

        if (oldData) {
            // Replace with changed data
            if (!equal(oldData, transformedData)) {
                this.petitions[data.id] = transformedData;
                this.emit('petition', transformedData, oldData);
            }
        } else {
            // Add new data
            this.petitions[data.id] = transformedData;
            this.petitions.length = this.petitions.length + 1;
            this.emit('petition', transformedData);
        }
    }


    private removePetitionData(data) {
        var oldData = this.petitions[data.id];
        var transformedData = this.conf.transformer(data);

        if (!transformedData) {
            this.emit('error', new Error('Failed to transform the petition data'));
            return;
        }

        if (oldData) {
            delete this.petitions[data.id];
            this.emit('removed-petition', transformedData, oldData);
        }
    }

    private detailLoader(id, action, latch, onSuccess) {
            // Schedule task for loading petition detail
            this.executor.execute(function() {
                this.petitionLoader
                    .load(id)
                    .onError(function (error) {
                        this.conf.debug('Error loading petition detail for \'%s\'', action);
                        this.emit('error', error);
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
    petitions: {[key:number]: any; length: number} = {
        length: 0
    };
    /**
     * Change the interval between loading pages.
     * @function
     * @param {number} newInterval - The new interval
     * @return {PetitionPager} - Self
     */
    setPageLoadInterval(newInterval) {
        this.conf.loadInterval = newInterval;
        this.executor.setInterval(newInterval);
        return this;
    };

    internalLoadPage(page, emitter, accepter?, remover?) {
        var self: PetitionPager = this;
        var summaryHandlerProvider = function(latch) {
            return function(summary) {
                if (remover && remover(summary, self.petitions)) {
                    if (!self.conf.loadDetail) {
                        self.conf.debug('Petition \'%s\' removed', summary.attributes.action);
                        self.removePetitionData(summary);
                        latch.release();
                    }
                    else {
                        self.detailLoader(summary.id, summary.attributes.action, latch, function(data) {
                            self.conf.debug('Petition \'%s\' detail removed', summary.attributes.action);
                            self.removePetitionData(data);
                        });
                    }
                    return;
                }

                if (accepter && !accepter(summary, self.petitions)) {
                    // Skip
                    self.conf.debug('Petition \'%s\' filtered', summary.attributes.action);
                    latch.release();
                    return;
                }

                if (!self.conf.loadDetail) {
                    // Store summary data
                    self.conf.debug('Petition \'%s\' summary stored', summary.attributes.action);
                    self.setPetitionData(summary);
                    latch.release();
                    return;
                }

                self.detailLoader(summary.id, summary.attributes.action, latch, function(data) {
                    self.conf.debug('Petition \'%s\' detail stored', summary.attributes.action);
                    self.setPetitionData(data);
                });
            };
        };

        var onPageLoaded = function(summary) {
            var currentLatch = new latch.Latch(summary.data.length);
            currentLatch.onRelease(function () {
                self.conf.debug('Page \'%s\' loaded', page);
                emitter.emit('page-loaded', summary);
            });
            summary.data.forEach(summaryHandlerProvider(currentLatch));
        };

        self.executor.execute(function() {
            self.conf.debug('Loading page \'%s\'', page);
            self.pageLoader
                .load(page)
                .onLoaded(onPageLoaded)
                .onError(self.emit.bind(self, 'error'));
        });
    };

    /**
     * Load petitions without specifying a state.
     * @return {PetitionPager} - Self
     */
    populateHot() {
        var emitter = new events.EventEmitter();
        emitter.on('page-loaded', function() {
            this.emit('loaded', this);
        });
        this.internalLoadPage(1, emitter);
        return this;
    };

    /**
     * Load all petitions.
     * @param {function} accepter - A predicate to test if a petition should be accepted.
     * @param {function} remover - A predicate to test if a petition should be removed.
     * @return {PetitionPager} - Self
     */
    populate(accepter, remover) {
        var emitter = new events.EventEmitter();
        var self = this;

        // Load the next page
        var loadNextPage = function (data) {
            if (data.links.next !== null) {
                var index = data.links.next.lastIndexOf('/'),
                    nextPath = data.links.next.substring(index);
                    self.internalLoadPage(nextPath, emitter, accepter, remover);
            }
            else {
                self.emit('loaded', self);
            }
        };

        emitter.on('page-loaded', loadNextPage);
        self.internalLoadPage('/petitions.json?page=1&state=all', emitter, accepter, remover);

        return self;
    };
}

}
