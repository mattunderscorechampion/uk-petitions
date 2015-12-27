
'use strict';

var Monitor = require('./petitions-monitor'),
    output = require('./simple-output');

new Monitor()
    .setMaxListeners(20)
    .on('error', output.error)
    .on('new-petition', function(data) {
        console.log('New petition \'%s\'', data.attributes.action);
    })
    .on('reached-10-signatures', function(data) {
        console.log('Petition \'%s\' has reached 10 signatures', data.attributes.action);
    })
    .on('reached-20-signatures', function(data) {
        console.log('Petition \'%s\' has reached 20 signatures', data.attributes.action);
    })
    .on('reached-50-signatures', function(data) {
        console.log('Petition \'%s\' has reached 50 signatures', data.attributes.action);
    })
    .on('reached-100-signatures', function(data) {
        console.log('Petition \'%s\' has reached 100 signatures', data.attributes.action);
    })
    .on('reached-250-signatures', function(data) {
        console.log('Petition \'%s\' has reached 250 signatures', data.attributes.action);
    })
    .on('reached-500-signatures', function(data) {
        console.log('Petition \'%s\' has reached 500 signatures', data.attributes.action);
    })
    .on('reached-1000-signatures', function(data) {
        console.log('Petition \'%s\' has reached 1000 signatures', data.attributes.action);
    })
    .on('reached-5000-signatures', function(data) {
        console.log('Petition \'%s\' has reached 5000 signatures', data.attributes.action);
    })
    .on('reached-response-threshold', function(data) {
        console.log('Petition \'%s\' has reached 10000 signatures', data.attributes.action);
    })
    .on('reached-50000-signatures', function(data) {
        console.log('Petition \'%s\' has reached 50000 signatures', data.attributes.action);
    })
    .on('reached-debate-threshold', function(data) {
        console.log('Petition \'%s\' has reached 100000 signatures', data.attributes.action);
    })
    .on('reached-500000-signatures', function(data) {
        console.log('Petition \'%s\' has reached 500000 signatures', data.attributes.action);
    })
    .on('government-responce', function(data) {
        console.log('The government has responded to the petition \'%s\'', data.attributes.action);
    })
    .on('debated', function(data) {
        console.log('Parliament has debated the petition \'%s\'', data.attributes.action);
    })
    .start();
