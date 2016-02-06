


/// <reference path="../node.d.ts" />

import loading = require('./loading');
import petitionUtil = require('../private/petition-util');

var getJsonOverHttps = petitionUtil.getJsonOverHttps;

/**
 * Constructor for petition loaders.
 * @constructor
 * @param {object} agent - The HTTP agemt to use to make requests.
 * @classdesc Loads the data of a petition. It is stateless.
 */
export class PetitionLoader {
    private agent: any;

    constructor(agent: any) {
        this.agent = agent;
    }
    /**
     * Load the petition by Id. Returns an emitter. Emits either 'loaded' or 'error' events.
     * The 'loaded' event is passed the data of the petition.
     * The 'error' event is passed the Error.
     * @return {Loading} - The emitter
     */
    load(petitionId: number): loading.Loading {
        var emitter = new loading.Loading();

        getJsonOverHttps({
            hostname: 'petition.parliament.uk',
            port: 443,
            path: '/petitions/' + petitionId + '.json',
            agent: this.agent
        })
        .on('error', emitter.error.bind(emitter))
        .on('data', function(data) {
            emitter.loaded(data.data);
        });

        return emitter;
    }
}
