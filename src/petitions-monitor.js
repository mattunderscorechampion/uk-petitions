
'use strict';

var util = require('util'),
    queries = require('./petition-queries'),
    EventEmitter = require('events'),
    PetitionPager = require('./petition-pager'),
    equal = require('deep-equal');

/**
 * Monitors the petitions data for changes and generates a notification event for changes.
 * @constructor
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
        accepter = function (summary, petitions) {
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
        };

    if (config) {
        if (config.initialInterval) {
            initialInterval = config.initialInterval;
        }
        if (config.interval) {
            interval = config.interval;
        }
        if (config.debug) {
            debug = function() {
                passDebug = true;
                console.log.apply(null, arguments);
            };
        }
        if (config.loadDetail !== undefined) {
            loadDetail = config.loadDetail;
        }
    }
    debug('Debug enabled');

    /**
     * Add an event to emit when the check function returns true. The check function is passed the the new data.
     */
    this.addMonitorEvent = function(event, check) {
        events.push({event : event, check : check});
        return self;
    };

    /**
     * Add an event to emit when the check function returns true. The check function is passed the the new and old data.
     */
    this.addMonitorDeltaEvent = function(event, check) {
        deltaEvents.push({event : event, check : check});
        return self;
    };

    /**
     * Start the monitor.
     */
    this.start = function () {
        debug('Starting monitor');
        var pager = new PetitionPager({
            loadInterval : initialInterval,
            debug : passDebug,
            loadDetail : loadDetail
        });

        self
        .addMonitorDeltaEvent('reached-10-signatures', queries.checks.delta.reached10)
        .addMonitorDeltaEvent('reached-20-signatures', queries.checks.delta.reached20)
        .addMonitorDeltaEvent('reached-50-signatures', queries.checks.delta.reached50)
        .addMonitorDeltaEvent('reached-100-signatures', queries.checks.delta.reached100)
        .addMonitorDeltaEvent('reached-250-signatures', queries.checks.delta.reached250)
        .addMonitorDeltaEvent('reached-500-signatures', queries.checks.delta.reached500)
        .addMonitorDeltaEvent('reached-1000-signatures', queries.checks.delta.reached1_000)
        .addMonitorDeltaEvent('reached-2000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(2000))
        .addMonitorDeltaEvent('reached-3000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(3000))
        .addMonitorDeltaEvent('reached-4000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(4000))
        .addMonitorDeltaEvent('reached-5000-signatures', queries.checks.delta.reached5_000)
        .addMonitorDeltaEvent('reached-6000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(6000))
        .addMonitorDeltaEvent('reached-7000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(7000))
        .addMonitorDeltaEvent('reached-8000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(8000))
        .addMonitorDeltaEvent('reached-9000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(9000))
        .addMonitorDeltaEvent('reached-response-threshold', queries.checks.delta.reachedResponseThreshold)
        .addMonitorDeltaEvent('reached-20000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(20000))
        .addMonitorDeltaEvent('reached-30000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(30000))
        .addMonitorDeltaEvent('reached-40000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(40000))
        .addMonitorDeltaEvent('reached-50000-signatures', queries.checks.delta.reached50_000)
        .addMonitorDeltaEvent('reached-60000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(60000))
        .addMonitorDeltaEvent('reached-70000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(70000))
        .addMonitorDeltaEvent('reached-80000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(80000))
        .addMonitorDeltaEvent('reached-90000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(90000))
        .addMonitorDeltaEvent('reached-debate-threshold', queries.checks.delta.reachedDebateThreshold)
        .addMonitorDeltaEvent('reached-250000-signatures', queries.checks.delta.reachedSignatureDeltaCountProvider(250000))
        .addMonitorDeltaEvent('reached-500000-signatures', queries.checks.delta.reached500_000)
        .addMonitorDeltaEvent('government-response', queries.checks.delta.governmentResponded)
        .addMonitorDeltaEvent('debate-transcript', queries.checks.delta.debateTranscriptAvailable);

        pager
        .on('petition', function(newData, oldData) {
            if (!oldData) {
                self.emit('new-petition', newData);
            }
            else {
                self.emit('updated-petition', newData, oldData);
            }

            events.forEach(function(registeredEvent) {
                if (registeredEvent.check(newData)) {
                    self.emit(registeredEvent.event, newData);
                }
            });

            if (oldData) {
                deltaEvents.forEach(function(registeredEvent) {
                    if (registeredEvent.check(newData, oldData)) {
                        self.emit(registeredEvent.event, newData);
                    }
                });
            }
        })
        .on('loaded', function() {
            debug('Initial petitions polled, found %d petitions, going again', pager.petitions.length);
            pager
                .setPageLoadInterval(interval)
                .removeAllListeners('loaded')
                .on('loaded', function() {
                    debug('All petitions polled, found %d petitions, going again', pager.petitions.length);
                    pager.populate(accepter);
                });
            self.emit('initial-load');
            pager.populate(accepter);
        })
        .populate(accepter);

        return self;
    };
}
util.inherits(PetitionsMonitor, EventEmitter);

module.exports = PetitionsMonitor;
