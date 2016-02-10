
/// <reference path="../node.d.ts" />

import loading = require('./loading');
import https = require('https');
import petitionUtil = require('../private/petition-util');

var getJsonOverHttps = petitionUtil.getJsonOverHttps;

/**
 * Constructor for petition page loaders.
 * @constructor
 * @param {object} agent - The HTTP agemt to use to make requests.
 * @classdesc Loads a page of petition summaries. It is stateless.
 */
export class PetitionPageLoader {
    private agent: https.Agent;

    constructor(agent?: https.Agent) {
        this.agent = agent;
    }

    /**
     * Load a page of petitions by number. Returns an emitter. Emits either 'loaded' or 'error' events.
     * The 'loaded' event is passed the data of the petition.
     * The 'error' event is passed the Error.
     * @function
     * @return {Loading} - The emitter
     */
    load(page: any): loading.Loading {
        var emitter: loading.Loading = new loading.Loading();
        var pathToLoad: string;

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
                emitter.error('Problem parameter');
                return emitter;
            }
        } else {
            emitter.error('Problem parameter');
            return emitter;
        }

        getJsonOverHttps({
            hostname: 'petition.parliament.uk',
            port: 443,
            path: pathToLoad,
            agent: this.agent
        })
        .on('error', emitter.error.bind(emitter))
        .on('data', emitter.loaded.bind(emitter));

        return emitter;
    }
}
