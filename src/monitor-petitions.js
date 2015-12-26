
'use strict';

var Monitor = require('./petitions-monitor'),
    output = require('./simple-output');

new Monitor()
    .on('error', output.error)
    .on('new-petition', function(data) {
        console.log('New petition \'%s\'', data.attributes.action);
    })
    .on('reached-response-threshold', function(data) {
        console.log('Petition \'%s\' has gone over 10000', data.attributes.action);
    })
    .on('reached-debate-threshold', function(data) {
        console.log('Petition \'%s\' has gone over 100000', data.attributes.action);
    })
    .on('government-responce', function(data) {
        console.log('The government has responded to the petition \'%s\'', data.attributes.action);
    })
    .on('debated', function(data) {
        console.log('Parliament has debated the petition \'%s\'', data.attributes.action);
    })
    .start();
