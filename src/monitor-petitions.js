
'use strict';

var Monitor = require('./petitions-monitor'),
    output = require('./simple-output'),
    util = require('util');

var m = new Monitor();
m.addSignatureNotification = function(signatures) {
    return this.on(util.format('reached-%d-signatures', signatures), function(data) {
        console.log('Petition \'%s\' has reached %d signatures', data.attributes.action, signatures);
    });
};

m.setMaxListeners(20)
    .on('error', output.error)
    .on('new-petition', function(data) {
        console.log('New petition \'%s\'', data.attributes.action);
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
        console.log('Petition \'%s\' has reached the threshold for a response', data.attributes.action);
    })
    .addSignatureNotification(50000)
    .on('reached-debate-threshold', function(data) {
        console.log('Petition \'%s\' has reached the threshold for a debate', data.attributes.action);
    })
    .addSignatureNotification(500000)
    .on('government-response', function(data) {
        console.log('The government has responded to the petition \'%s\' https://petition.parliament.uk/petitions/%d', data.attributes.action, data.id);
    })
    .on('debate-transcript', function(data) {
        console.log('The transcript for the debate of \'%s\' %s', data.attributes.action, data.attributes.debate.transcript_url);
    })
    .start();
