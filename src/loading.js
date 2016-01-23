
'use strict';

var EventEmitter = require('events'),
    util = require('util');

/**
 * The emitter returned by methods that load data from an external source.
 * @constructor
 * @fires Loading#error
 * @fires Loading#loaded
 */
function Loading(config) {
    EventEmitter.call(this);
}
util.inherits(Loading, EventEmitter);
Loading.prototype.loaded = function(data) {
    this.emit('loaded', data);
};
Loading.prototype.error = function(error) {
    if (typeof error === 'string') {
        this.emit('error', new Error(error));
        return;
    }
    else if (typeof error === 'object') {
        if (error instanceof String) {
            this.emit('error', new Error(error));
            return;
        }
        else if (error instanceof Error) {
            this.emit('error', error);
            return;
        }
    }
    this.emit('error', '' + error);
};
Loading.prototype.onLoaded = function(handler) {
    this.on('loaded', handler);
};
Loading.prototype.onError = function(handler) {
    this.on('error', handler);
};

/**
 * Emitted when there is an error loading the data.
 * @event Loading#error
 */

/**
 * Emitted when the data has been loaded successfuly.
 * @event Loading#loaded
 */

module.exports = Loading;
