
'use strict';

var util = require('util'),
    queries = require('../target/js/public/petition-queries'),
    EventEmitter = require('events'),
    PetitionPager = require('../target/js/public/petition-pager').PetitionPager,
    equal = require('deep-equal');

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
    if (config.raw) {
        return acceptRaw(summary, petitions);
    }
    return acceptEnriched(summary, petitions);
}

function removeRaw (summary, petitions) {
    return summary.attributes.state === 'rejected' || summary.attributes.state === 'closed';
}

function removeEnriched (summary, petitions) {
    return summary.state === 'rejected' || summary.state === 'closed';
}

function standardRemover (config, summary, petitions) {
    if (config.raw) {
        return removeRaw(summary, petitions);
    }
    return removeEnriched(summary, petitions);
}

 /**
  * Private constructor for petition monitor config.
  * @constructor
  * @classdesc Configuration for PetitionsMonitor.
  * @property {number} initialInterval - The initial interval.
  * @property {number} interval - The interval.
  * @property {boolean} debug - If debug logging should be enabled.
  * @property {boolean} loadDetail - If detailed petition information should be loaded.
  * @property {function} accepter - The accepting function.
  * @property {function} remover - The remover function.
  * @property {boolean} raw - If the petitions loaded should be raw.
  */
function PetitionsMonitorConfig(config) {
    this.initialInterval = 200;
    this.interval = 2000;
    this.passDebug = false;
    this.debug = function() {};
    this.loadDetail = false;
    this.accepter = standardAccepter.bind(null, this);
    this.remover = standardRemover.bind(null, this);
    this.raw = false;

    if (config) {
        if (config.initialInterval) {
            this.initialInterval = config.initialInterval;
        }
        if (config.interval) {
            this.interval = config.interval;
        }
        if (config.debug) {
            this.passDebug = true;
            this.debug = logDebug;
        }
        if (config.loadDetail !== undefined) {
            this.loadDetail = config.loadDetail;
        }
        if (config.accepter !== undefined) {
            this.accepter = config.accepter;
        }
        if (config.remover !== undefined) {
            this.remover = config.remover;
        }
        if (config.raw) {
            this.raw = true;
        }
    }
}

/**
 * Constructor for petition pager.
 * @constructor
 * @param {PetitionsMonitorConfig} config - Configuration for PetitionsMonitor.
 * @classdesc Monitors the petitions data for changes and generates a notification event for changes.
 * @fires PetitionsMonitor#new-petition
 * @fires PetitionsMonitor#updated-petition
 * @fires PetitionsMonitor#initial-load
 * @augments EventEmitter
 */
function PetitionsMonitor(config) {
    EventEmitter.call(this);
    var self = this,
        events = [],
        deltaEvents = [],
        conf = new PetitionsMonitorConfig(config);

    conf.debug('Debug enabled');

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
        conf.debug('Starting monitor');
        var pager = new PetitionPager({
            loadInterval : conf.initialInterval,
            debug : conf.passDebug,
            loadDetail : conf.loadDetail,
            transformer : conf.raw ? function (petiton) { return petiton; } : null
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
            conf.debug('Initial petitions polled, found %d petitions, going again', pager.petitions.length);
            pager
                .setPageLoadInterval(conf.interval)
                .removeAllListeners('loaded')
                .on('loaded', function() {
                    conf.debug('All petitions polled, found %d petitions, going again', pager.petitions.length);
                    self.emit('loaded', pager.petitions);
                    pager.populate(conf.accepter, conf.remover);
                });
            self.emit('initial-load', pager.petitions);
            pager.populate(conf.accepter, conf.remover);
        })
        .populate(conf.accepter, conf.remover);

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

module.exports = PetitionsMonitor;
