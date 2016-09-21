
/// <reference path="../node.d.ts" />

import events = require('events');
import util = require('util');
import queries = require('./petition-queries');
import petitionPager = require('./petition-pager');
import equal = require('deep-equal');

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
  * Configuration for PetitionsMonitor.
  */
class PetitionsMonitorConfig {
    /**
     * The initial interval.
     */
    initialInterval = 200;
    /**
     * The interval.
     */
    interval = 2000;
    /**
     * If debug should be passed to the loaders.
     */
    passDebug: boolean = false;
    /**
     * If debug logging should be enabled.
     */
    debug = function(message: string, ...objects: any[]) {};
    /**
     * If detailed petition information should be loaded.
     */
    loadDetail = false;
    /**
     * The accepting function.
     */
    accepter = standardAccepter.bind(null, this);
    /**
     * The remover function.
     */
    remover = standardRemover.bind(null, this);
    /**
     * If the petitions loaded should be raw.
     */
    raw: boolean = false;

    constructor(config?: any) {
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
}

export module UkPetitions {

    /**
     * Monitors the petitions data for changes and generates a notification event for changes.
     */
    export class PetitionsMonitor extends events.EventEmitter {
        private events = [];
        private deltaEvents = [];
        private conf: PetitionsMonitorConfig;

        /**
         * Constructor for petition pager.
         * @param config Configuration for PetitionsMonitor.
         */
        constructor(config: any) {
            super();
            this.conf = new PetitionsMonitorConfig(config);
            this.conf.debug('Debug enabled');
        }

        /**
         * Add an event to emit when the check function returns true. The check function is passed the the new data. Returns the monitor.
         * @param event The name of the event to add.
         * @param check The predicate required to emit the event.
         */
        addMonitorEvent(event, check): PetitionsMonitor {
            this.events.push({event : event, check : check});
            return this;
        }

        /**
         * Add an event to emit when the check function returns true. The check function is passed the the new and old data. Returns the monitor.
         * @param event The name of the event to add.
         * @param check The check required to emit the event.
         */
        addMonitorDeltaEvent(event, check): PetitionsMonitor {
            this.deltaEvents.push({event : event, check : check});
            return this;
        }

        on(eventName: string, listener: {(...eventObjects: any[]): void;}): PetitionsMonitor;
        /**
         * @event A new petition has been added
         */
        on(eventName: 'new-petition', listener: {(...eventObjects: any[]): void;}): PetitionsMonitor;
        /**
         * @event An existing petition has been updated
         */
        on(eventName: 'updated-petition', listener: {(...eventObjects: any[]): void;}): PetitionsMonitor;
        /**
         * @event An existing petition has been removed
         */
        on(eventName: 'removed-petition', listener: {(...eventObjects: any[]): void;}): PetitionsMonitor;
        on(eventName: string, listener: {(...eventObjects: any[]): void;}): PetitionsMonitor {
            super.on(eventName, listener);
            return this;
        }

        /**
         * Start the monitor. Returns the monitor.
         */
        start(): PetitionsMonitor {
            this.conf.debug('Starting monitor');
            var pager: petitionPager.UkPetitions.PetitionPager = new petitionPager.UkPetitions.PetitionPager({
                loadInterval : this.conf.initialInterval,
                debug : this.conf.passDebug,
                loadDetail : this.conf.loadDetail,
                transformer : this.conf.raw ? function (petiton) { return petiton; } : null
            });
            var self: PetitionsMonitor = this;

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
                self.events.forEach(function(registeredEvent) {
                    if (registeredEvent.check(newData)) {
                        self.emit(registeredEvent.event, newData);
                    }
                });

                if (oldData) {
                    // Check for events to emit based on the current and previous values
                    self.deltaEvents.forEach(function(registeredEvent) {
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
                self.conf.debug('Initial petitions polled, found %d petitions, going again', pager.petitions.length);
                pager
                    .setPageLoadInterval(this.conf.interval)
                    .removeAllListeners('loaded')
                    .on('loaded', function() {
                        self.conf.debug('All petitions polled, found %d petitions, going again', pager.petitions.length);
                        self.emit('loaded', pager.petitions);
                        pager.populate(self.conf.accepter, self.conf.remover);
                    });
                self.emit('initial-load', pager.petitions);
                pager.populate(self.conf.accepter, self.conf.remover);
            });
            pager.populate(self.conf.accepter, self.conf.remover);

            return self;
        }
    }

}
