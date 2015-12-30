
'use strict';

var https = require("https"),
    EventEmitter = require('events');

/**
 * Forward an error to another emitter.
 */
var forwardError = function (emitter) {
    return function (error) {
        emitter.emit('error', error);
    };
};

/**
 * Request a JSON object over HTTPS. Returns an emitter. Emits 'response',
 * 'data' and 'error' events.
 * The response event is passed the HTTPS response.
 * If the status code is 200 a 'data' event should be emitted, passed an object
 * parsed from the JSON data.
 * If there is an error making the request an error event will be emitted.
 */
var getJsonOverHttps = function (options) {
    var emitter = new EventEmitter();

    https.get(options, function (res) {
        emitter.emit('response', res);
        if (res.statusCode === 200) {
            var buffers = [];
            res
                .on('data', function (d) {
                    buffers.push(d);
                })
                .on('end', function () {
                    var completeBuffer = Buffer.concat(buffers);
                    emitter.emit('data', JSON.parse(completeBuffer));
                });
        }
    })
    .on('error', forwardError(emitter));

    return emitter;
};

module.exports = {
    forwardError : forwardError,
    getJsonOverHttps : getJsonOverHttps
};
