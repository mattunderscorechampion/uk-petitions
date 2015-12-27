
'use strict';

var util = require('util'),
    queries = require('./petition-queries'),
    EventEmitter = require('events'),
    PetitionPager = require('./petition-pager');

function PetitionsMonitor() {
    EventEmitter.call(this);
    var self = this;

    this.start = function () {
        var pager = new PetitionPager();
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

        pager
            .setMaxListeners(20)
            .on('petition', function(newData, oldData) {
                if (!oldData) {
                    self.emit('new-petition', newData);
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
            .on('open-loaded', function() {
                pager
                    .removeAllListeners('open-loaded')
                    .on('open-loaded', function() {
                        pager.populateOpen();
                    })
                    .emit('initial-load');
                pager.populateOpen();
            })
            .populateOpen();

        return self;
    };
}
util.inherits(PetitionsMonitor, EventEmitter);

module.exports = PetitionsMonitor;
