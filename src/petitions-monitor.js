
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
        loadDetail = true;
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

    this.start = function () {
        debug('Starting monitor');
        var pager = new PetitionPager({ loadInterval : initialInterval, debug : passDebug, loadDetail : loadDetail });
        pager.addDeltaCheck = function(event, check) {
            this.on('petition', function(newData, oldData) {
                if (oldData) {
                    if (check(newData, oldData)) {
                        self.emit(event, newData);
                    }
                }
            });
            return this;
        };

        // Only update when interesting details change
        var accepter = function (summary, petitions) {
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

        pager
            .setMaxListeners(20)
            .on('petition', function(newData, oldData) {
                if (!oldData) {
                    self.emit('new-petition', newData);
                }
                else {
                    self.emit('updated-petition', newData);
                }
            })
            .addDeltaCheck('reached-10-signatures', queries.checks.delta.reached10)
            .addDeltaCheck('reached-20-signatures', queries.checks.delta.reached20)
            .addDeltaCheck('reached-50-signatures', queries.checks.delta.reached50)
            .addDeltaCheck('reached-100-signatures', queries.checks.delta.reached100)
            .addDeltaCheck('reached-250-signatures', queries.checks.delta.reached250)
            .addDeltaCheck('reached-500-signatures', queries.checks.delta.reached500)
            .addDeltaCheck('reached-1000-signatures', queries.checks.delta.reached1_000)
            .addDeltaCheck('reached-5000-signatures', queries.checks.delta.reached5_000)
            .addDeltaCheck('reached-response-threshold', queries.checks.delta.reachedResponseThreshold)
            .addDeltaCheck('reached-50000-signatures', queries.checks.delta.reached50_000)
            .addDeltaCheck('reached-debate-threshold', queries.checks.delta.reachedDebateThreshold)
            .addDeltaCheck('reached-500000-signatures', queries.checks.delta.reached500_000)
            .addDeltaCheck('government-response', queries.checks.delta.governmentResponded)
            .addDeltaCheck('debate-transcript', queries.checks.delta.debateTranscriptAvailable)
            .on('loaded', function() {
                debug('Initial petitions polled, found %d petitions, going again', pager.petitions.length);
                pager
                    .setPageLoadInterval(interval)
                    .removeAllListeners('loaded')
                    .on('loaded', function() {
                        debug('All petitions polled, found %d petitions, going again', pager.petitions.length);
                        pager.populate(accepter);
                    })
                    .emit('initial-load');
                pager.populate(accepter);
            })
            .populate(accepter);

        return self;
    };
}
util.inherits(PetitionsMonitor, EventEmitter);

module.exports = PetitionsMonitor;
