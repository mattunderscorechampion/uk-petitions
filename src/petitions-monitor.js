
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

        pager
        .setMaxListeners(20)
        .on('petition', function(newData, oldData) {
            if (!oldData) {
                self.emit('new-petition', newData);
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached10(newData, oldData)) {
                    self.emit('reached-10-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached20(newData, oldData)) {
                    self.emit('reached-20-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached50(newData, oldData)) {
                    self.emit('reached-50-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached100(newData, oldData)) {
                    self.emit('reached-100-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached250(newData, oldData)) {
                    self.emit('reached-250-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached500(newData, oldData)) {
                    self.emit('reached-500-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached1_000(newData, oldData)) {
                    self.emit('reached-1000-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached5_000(newData, oldData)) {
                    self.emit('reached-5000-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reachedResponseThreshold(newData, oldData)) {
                    self.emit('reached-response-threshold', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached50_000(newData, oldData)) {
                    self.emit('reached-50000-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reachedDebateThreshold(newData, oldData)) {
                    self.emit('reached-debate-threshold', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached500_000(newData, oldData)) {
                    self.emit('reached-500000-signatures', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.governmentResponded(newData, oldData)) {
                    self.emit('government-response', newData);
                }
            }
        })
        .on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.debated(newData, oldData)) {
                    self.emit('debated', newData);
                }
            }
        })
        .on('open-loaded', function() {
            pager.populateOpen();
        });
        pager.populateOpen();

        return self;
    };
}
util.inherits(PetitionsMonitor, EventEmitter);

module.exports = PetitionsMonitor;
