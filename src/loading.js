
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

/**
 * Emitted when there is an error loading the data.
 * @event Loading#error
 */

/**
 * Emitted when the data has been loaded successfuly.
 * @event Loading#loaded
 */

module.exports = Loading;
