
'use strict';

var EventEmitter = require('events'),
    petitionUtil = require('./petition-util');

var forwardError = petitionUtil.forwardError;
var getJsonOverHttps = petitionUtil.getJsonOverHttps;

/**
 * Loads a page of petition summaries. It is stateless.
 * @constructor
 */
function PetitionPageLoader(agent) {
    /**
     * Load a page of petitions by number. Returns an emitter. Emits either 'loaded' or 'error' events.
     * The 'loaded' event is passed the data of the petition.
     * The 'error' event is passed the Error.
     */
    this.load = function (page) {
        var emitter = new EventEmitter(),
            pathToLoad;

        if (typeof page === 'number') {
            pathToLoad = '/petitions.json?page=' + page;
        } else if (typeof page === 'string') {
            pathToLoad = page;
        } else if (typeof page === 'object') {
            if (page instanceof String) {
                pathToLoad = page;
            } else if (page instanceof Number) {
                pathToLoad = '/petitions.json?page=' + page;
            } else {
                emitter.emit('error', new Error('Problem parameter'));
                return emitter;
            }
        } else {
            emitter.emit('error', new Error('Problem parameter'));
            return emitter;
        }

        getJsonOverHttps({
            hostname: 'petition.parliament.uk',
            port: 443,
            path: pathToLoad,
            agent: agent
        })
        .on('error', forwardError(emitter))
        .on('data', function (data) {
            emitter.emit('loaded', data);
        });

        return emitter;
    };
}

/**
 * Emitted when there is an error loading the data.
 * @event PetitionPageLoader#error
 */

/**
 * Emitted when the data has been loaded successfuly.
 * @event PetitionPageLoader#loaded
 */

module.exports = PetitionPageLoader;
