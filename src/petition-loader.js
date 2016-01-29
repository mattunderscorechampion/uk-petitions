
'use strict';

var Loading = require('./loading'),
    petitionUtil = require('./petition-util');

var getJsonOverHttps = petitionUtil.getJsonOverHttps;

/**
 * Constructor for petition loaders.
 * @constructor
 * @param {object} agent - The HTTP agemt to use to make requests.
 * @classdesc Loads the data of a petition. It is stateless.
 */
function PetitionLoader(agent) {
    /**
     * Load the petition by Id. Returns an emitter. Emits either 'loaded' or 'error' events.
     * The 'loaded' event is passed the data of the petition.
     * The 'error' event is passed the Error.
     * @return {Loading} - The emitter
     */
    this.load = function load(petitionId) {
        var emitter = new Loading();

        getJsonOverHttps({
            hostname: 'petition.parliament.uk',
            port: 443,
            path: '/petitions/' + petitionId + '.json',
            agent: agent
        })
        .on('error', emitter.error.bind(emitter))
        .on('data', function(data) {
            emitter.loaded(data.data);
        });

        return emitter;
    };
}

module.exports = PetitionLoader;
