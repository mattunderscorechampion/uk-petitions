
'use strict';

var util = require('util'),
    queries = require('./petition-queries'),
    EventEmitter = require('events'),
    PetitionPager = require('./petition-pager'),
    equal = require('deep-equal'),
    EnrichedPetition = require('./enriched-petition');

function logDebug () {
    console.log.apply(null, arguments);
}

function acceptRaw(summary, petitions) {
    if (summary.attributes.state !== 'rejected' && summary.attributes.state !== 'closed') {
        var currentInfo = petitions[summary.id];
        if (currentInfo) {
            return currentInfo.attributes.signature_count !== summary.attributes.signature_count ||
                !equal(currentInfo.attributes.government_response, summary.attributes.government_response) ||
                !equal(currentInfo.attributes.debate, summary.attributes.debate);
        }
        else {
            return true;
        }
    }
    return false;
}

function acceptEnriched (summary, petitions) {
    if (summary.state !== 'rejected' && summary.state !== 'closed') {
        var currentInfo = petitions[summary.id];
        if (currentInfo) {
            return currentInfo.signature_count !== summary.signature_count ||
                !equal(currentInfo.government_response, summary.government_response) ||
                !equal(currentInfo.debate, summary.debate);
        }
        else {
            return true;
        }
    }
    return false;
}

function standardAccepter (config, summary, petitions) {
    if (config.enrich) {
        return acceptEnriched(summary, petitions);
    }
    return acceptRaw(summary, petitions);
}

function removeRaw (summary, petitions) {
    return summary.attributes.state === 'rejected' || summary.attributes.state === 'closed';
}

function removeEnriched (summary, petitions) {
    return summary.state === 'rejected' || summary.state === 'closed';
}

function standardRemover (config, summary, petitions) {
    if (config.enrich) {
        return removeEnriched(summary, petitions);
    }
    return removeRaw(summary, petitions);
}

/**
 * Configuration for PetitionsMonitor.
 * @typedef {object} PetitionsMonitor~Config
 * @property {number} initialInterval - The initial interval.
 * @property {number} interval - The interval.
 * @property {boolean} debug - If debug logging should be enabled.
 * @property {boolean} loadDetail - If detailed petition information should be loaded.
 * @property {function} accepter - The accepting function.
 * @property {function} remover - The remover function.
 * @property {boolean} enrich - If the petitions loaded should be enriched.
 */

/**
 * Monitors the petitions data for changes and generates a notification event for changes.
 * @constructor
 * @param {PetitionsMonitor~Config} config - Configuration for PetitionsMonitor.
 */
function PetitionsMonitor(config) {
    EventEmitter.call(this);
    var self = this,
        initialInterval = 200,
        interval = 2000,
        passDebug = false,
        debug = function() {},
        loadDetail = true,
        events = [],
        deltaEvents = [],
        accepter = standardAccepter.bind(null, config),
        remover = standardRemover.bind(null, config),
        enrich = false;

    if (config) {
        if (config.initialInterval) {
            initialInterval = config.initialInterval;
        }
        if (config.interval) {
            interval = config.interval;
        }
        if (config.debug) {
            passDebug = true;
            debug = logDebug;
        }
        if (config.loadDetail !== undefined) {
            loadDetail = config.loadDetail;
        }
        if (config.accepter !== undefined) {
            accepter = config.accepter;
        }
        if (config.remover !== undefined) {
            remover = config.remover;
        }
        if (config.enrich) {
            enrich = true;
        }
    }
    debug('Debug enabled');

    /**
     * Add an event to emit when the check function returns true. The check function is passed the the new data. Returns the monitor.
     * @param {string} event - The name of the event to add.
     * @param {function} check - The predicate required to emit the event.
     */
    this.addMonitorEvent = function(event, check) {
        events.push({event : event, check : check});
        return self;
    };

    /**
     * Add an event to emit when the check function returns true. The check function is passed the the new and old data. Returns the monitor.
     * @param {string} event - The name of the event to add.
     * @param {function} check - The check required to emit the event.
     */
    this.addMonitorDeltaEvent = function(event, check) {
        deltaEvents.push({event : event, check : check});
        return self;
    };

    /**
     * Start the monitor. Returns the monitor.
     */
    this.start = function () {
        debug('Starting monitor');
        var pager = new PetitionPager({
            loadInterval : initialInterval,
            debug : passDebug,
            loadDetail : loadDetail,
            transformer : enrich ? function (raw) { return new EnrichedPetition(raw); } : null
        });

        pager
        .on('petition', function(newData, oldData) {
            // Emit new or update event
            if (!oldData) {
                self.emit('new-petition', newData);
            }
            else {
                self.emit('updated-petition', newData, oldData);
            }

            // Check for events to emit based on the current value
            events.forEach(function(registeredEvent) {
                if (registeredEvent.check(newData)) {
                    self.emit(registeredEvent.event, newData);
                }
            });

            if (oldData) {
                // Check for events to emit based on the current and previous values
                deltaEvents.forEach(function(registeredEvent) {
                    if (registeredEvent.check(newData, oldData)) {
                        self.emit(registeredEvent.event, newData);
                    }
                });
            }
        })
        .on('removed-petition', function (newData, oldData) {
            self.emit('removed-petition', newData, oldData);
        })
        .on('loaded', function() {
            debug('Initial petitions polled, found %d petitions, going again', pager.petitions.length);
            pager
                .setPageLoadInterval(interval)
                .removeAllListeners('loaded')
                .on('loaded', function() {
                    debug('All petitions polled, found %d petitions, going again', pager.petitions.length);
                    self.emit('loaded', pager.petitions);
                    pager.populate(accepter, remover);
                });
            self.emit('initial-load', pager.petitions);
            pager.populate(accepter, remover);
        })
        .populate(accepter, remover);

        return self;
    };
}
util.inherits(PetitionsMonitor, EventEmitter);

/**
 * New petition event.
 * @event PetitionsMonitor#new-petition
 * @type {Petitions.Petition|EnrichedPetition}
 */

/**
 * Updated petition event.
 * @event PetitionsMonitor#updated-petition
 * @type {Petitions.Petition|EnrichedPetition}
 */

/**
 * Emited after all the data has been loaded for the first time.
 * @event PetitionsMonitor#initial-load
 */

/**
 * Emited after all the data has been loaded after the first time.
 * @event PetitionsMonitor#loaded
 */

module.exports = PetitionsMonitor;
