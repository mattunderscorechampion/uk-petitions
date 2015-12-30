
'use strict';

var EventEmitter = require('events'),
    petitionUtil = require('./petition-util');

var forwardError = petitionUtil.forwardError;
var getJsonOverHttps = petitionUtil.getJsonOverHttps;

/**
 * Loads the data of a petition. It is stateless.
 * @constructor
 */
function PetitionLoader(agent) {
    /**
     * Load the petition by Id. Returns an emitter. Emits either 'loaded' or 'error' events.
     * The 'loaded' event is passed the data of the petition.
     * The 'error' event is passed the Error.
     */
    this.load = function (petitionId) {
        var emitter = new EventEmitter();

        getJsonOverHttps({
            hostname: 'petition.parliament.uk',
            port: 443,
            path: '/petitions/' + petitionId + '.json',
            agent: agent
        })
            .on('error', forwardError(emitter))
            .on('data', function (data) {
                emitter.emit('loaded', data.data);
            });

        return emitter;
    };
}

module.exports = PetitionLoader;
