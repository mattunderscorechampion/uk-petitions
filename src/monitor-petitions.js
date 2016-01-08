
'use strict';

var Monitor = require('./petitions-monitor'),
    output = require('./simple-output'),
    util = require('util'),
    queries = require('./petition-queries');

module.exports = {
    start : function() {
        var m = new Monitor({debug: false, loadDetail: false, enrich : true});
        m.addSignatureNotification = function(signatures) {
            var event = util.format('reached-%d-signatures', signatures);
            this.addMonitorDeltaEvent(event, queries.checks.delta.reachedSignatureDeltaCountProvider(signatures));
            return this.on(event, function(data) {
                console.log('Petition \'%s\' has reached %d signatures', data.action, signatures);
            });
        };

        m
        .addMonitorDeltaEvent('reached-response-threshold', queries.checks.delta.reachedResponseThreshold)
        .addMonitorDeltaEvent('reached-debate-threshold', queries.checks.delta.reachedDebateThreshold)
        .addMonitorDeltaEvent('government-response', queries.checks.delta.governmentResponded)
        .addMonitorDeltaEvent('debate-transcript', queries.checks.delta.debateTranscriptAvailable)
        .setMaxListeners(20)
        .on('error', output.error)
        .on('initial-load', function() {
            m
            .removeAllListeners('initial-load')
            .on('new-petition', function(data) {
                console.log('New petition \'%s\'', data.action);
            })
            .on('updated-petition', function(data) {
                console.log('Updated petition \'%s\' has %d signatures', data.action, data.signature_count);
            })
            .addSignatureNotification(10)
            .addSignatureNotification(20)
            .addSignatureNotification(50)
            .addSignatureNotification(100)
            .addSignatureNotification(250)
            .addSignatureNotification(500)
            .addSignatureNotification(1000)
            .addSignatureNotification(5000)
            .on('reached-response-threshold', function(data) {
                console.log('Petition \'%s\' has reached the threshold for a response', data.action);
            })
            .addSignatureNotification(50000)
            .on('reached-debate-threshold', function(data) {
                console.log('Petition \'%s\' has reached the threshold for a debate', data.action);
            })
            .addSignatureNotification(500000)
            .on('government-response', function(data) {
                console.log('Response to \'%s\' https://petition.parliament.uk/petitions/%d', data.action, data.id);
            })
            .on('debate-transcript', function(data) {
                console.log('Debate of \'%s\' %s', data.action, data.debate.transcript_url);
            });
        })
        .start();
    }
};
