
'use strict';

var Loading = require('./loading'),
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
     * @return {Loading} - The emitter
     */
    this.load = function (petitionId) {
        var emitter = new Loading();

        getJsonOverHttps({
            hostname: 'petition.parliament.uk',
            port: 443,
            path: '/petitions/' + petitionId + '.json',
            agent: agent
        })
        .on('error', forwardError(emitter))
        .on('data', emitter.loaded);

        return emitter;
    };
}

module.exports = PetitionLoader;
