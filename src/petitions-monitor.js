
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

        pager.on('petition', function(newData, oldData) {
            if (oldData) {
                if (queries.checks.delta.reached10_000(newData, oldData)) {
                    self.emit('reached-response-threshold', newData);
                }
                if (queries.checks.delta.reached100_000(newData, oldData)) {
                    self.emit('reached-debate-threshold', newData);
                }
                if (queries.checks.delta.governmentResponded(newData, oldData)) {
                    self.emit('government-responce', newData);
                }
                if (queries.checks.delta.debated(newData, oldData)) {
                    self.emit('debated', newData);
                }
            }
            else {
                self.emit('new-petition', newData);
            }
        });

        pager.on('open-loaded', function() {
            pager.populateOpen();
        });
        pager.populateOpen();

        return self;
    };
}
util.inherits(PetitionsMonitor, EventEmitter);

module.exports = PetitionsMonitor;
