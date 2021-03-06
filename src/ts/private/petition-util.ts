
/// <reference path="../node.d.ts" />

import events = require('events');
import https = require('https');

/**
 * Request a JSON object over HTTPS. Returns an emitter. Emits 'response',
 * 'data' and 'error' events.
 * The response event is passed the HTTPS response.
 * If the status code is 200 a 'data' event should be emitted, passed an object
 * parsed from the JSON data.
 * If there is an error making the request an error event will be emitted.
 */
export function getJsonOverHttps(options: https.RequestOptions): events.EventEmitter {
    var emitter = new events.EventEmitter();

    https.get(options, function (res) {
        emitter.emit('response', res);
        if (res.statusCode === 200) {
            var buffers = [];
            res
                .on('data', function (d: Buffer) {
                    buffers.push(d);
                })
                .on('end', function () {
                    var completeBuffer = Buffer.concat(buffers);
                    emitter.emit('data', JSON.parse(completeBuffer.toString('utf8')));
                });
        }
        else {
            emitter.emit('error', new Error('Response status code was ' + res.statusCode));
        }
    })
    .on('error', emitter.emit.bind(emitter, 'error'));

    return emitter;
};

/**
 * Freeze the object subgraph.
 * @property {object} obj - The root object to freeze
 */
export function recursiveFreeze(obj: any): any {
    if (obj === undefined || obj === null || typeof obj !== 'object') {
        return obj;
    }
    var propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function(name) {
        recursiveFreeze(obj[name]);
    });
    return Object.freeze(obj);
}
