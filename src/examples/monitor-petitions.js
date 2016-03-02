
'use strict';

var ukPetitions = require('../../'),
    util = require('util');

var m = new ukPetitions.PetitionsMonitor({debug: false, passDebug: true});
m.addSignatureNotification = function(signatures) {
    var event = util.format('reached-%d-signatures', signatures);
    this.addMonitorDeltaEvent(event, ukPetitions.checks.delta.reachedSignatureDeltaCountProvider(signatures));
    return this.on(event, function(data) {
        console.log('Petition \'%s\' has reached %d signatures', data.action, signatures);
    });
};

m
.addMonitorDeltaEvent('reached-response-threshold', ukPetitions.checks.delta.reachedResponseThreshold)
.addMonitorDeltaEvent('reached-debate-threshold', ukPetitions.checks.delta.reachedDebateThreshold)
.addMonitorDeltaEvent('government-response', ukPetitions.checks.delta.governmentResponded)
.addMonitorDeltaEvent('debate-transcript', ukPetitions.checks.delta.debateTranscriptAvailable)
.setMaxListeners(20)
.on('error', ukPetitions.output.error)
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
