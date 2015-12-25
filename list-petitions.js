
'use strict';

var https = require("https");
var util = require('util');
var EventEmitter = require('events');

function CountDownLatch(num) {
    var number = num, callbacks = [];

    this.countDown = function () {
        if (number > 0) {
            number = number - 1;
            if (number === 0) {
                callbacks.forEach(function (callback) {
                    callback();
                });
            }
        }
    };

    this.await = function (callback) {
        if (number === 0) {
            callback();
        } else {
            callbacks.push(callback);
        }
    };
}

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
            res.on('data', function (d) {
                buffers.push(d);
            }).on('end', function () {
                var completeBuffer = Buffer.concat(buffers);
                emitter.emit('data', JSON.parse(completeBuffer));
            });
        }
    }).on('error', forwardError(emitter));

    return emitter;
};

/**
 * Loads the data of a petition. It is stateless.
 */
function PetitionLoader() {
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
            path: '/petitions/' + petitionId + '.json'
        }).on('error', forwardError(emitter)).on('data', function (data) {
            emitter.emit('loaded', data.data);
        });
        return emitter;
    };
}

function PetitionPageLoader() {
    /**
     * Load a page of petitions by number. Returns an emitter. Emits either 'loaded' or 'error' events.
     * The 'loaded' event is passed the data of the petition.
     * The 'error' event is passed the Error.
     */
    this.load = function (page) {
        var emitter = new EventEmitter(), pathToLoad;
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
            path: pathToLoad
        }).on('error', forwardError(emitter)).on('data', function (data) {
            emitter.emit('loaded', data);
        });
        return emitter;
    };
}

function PetitionPager() {
    EventEmitter.call(this);
    var self = this, petitionLoader = new PetitionLoader(), pageLoader = new PetitionPageLoader(), setPetitionData = function (data) {
        var update = self.petitions[data.id];
        self.petitions[data.id] = data;
        if (update) {
            self.emit('petition', data);
        } else {
            self.petitions.length = self.petitions.length + 1;
            self.emit('petition', data);
        }
    };
    this.petitions = {
        length: 0
    };

    this.populateAll = function () {
        // Load the next page
        var loadNextPage = function (data) {
            var latch = new CountDownLatch(data.data.length);
            latch.await(function () {
                if (data.links.next !== null) {
                    var index = data.links.next.lastIndexOf('/'), nextPath = data.links.next.substring(index);
                    pageLoader.load(nextPath).on('loaded', loadNextPage);
                } else {
                    self.emit('all-loaded', self);
                }
            });
            data.data.forEach(function (data) {
                petitionLoader.load(data.id).on('error', function (error) {
                    self.emit('error', error);
                    latch.countDown();
                }).on('loaded', function (data) {
                    setPetitionData(data);
                    latch.countDown();
                });
            });
        };

        // Load first page
        pageLoader.load(1).on('loaded', loadNextPage).on('error', forwardError(self));

        return self;
    };

    this.populateRecent = function () {
        // Load first page
        pageLoader.load(1).on('loaded', function (data) {
            var countDown = new CountDownLatch(data.data.length);
            countDown.await(function () {
                self.emit('recent-loaded', self);
            });
            data.data.forEach(function (data) {
                petitionLoader.load(data.id).on('error', function (error) {
                    self.emit('error', error);
                    countDown.countDown();
                }).on('loaded', function (data) {
                    setPetitionData(data);
                    countDown.countDown();
                });
            });
        }).on('error', forwardError(self));

        return self;
    };
}
util.inherits(PetitionPager, EventEmitter);

var logByCountry = function (data) {
    console.log(data.attributes.action);
    var total_signatures = data.attributes.signature_count;
    data.attributes.signatures_by_country.forEach(function (pair) {
        var percentage = (pair.signature_count / total_signatures) * 100;
        console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
    });
};

/**
 * Print out all the attributes of a petition.
 */
var logAttributes = function (data) {
    console.log(data.attributes);
};

/**
 * Print out the action of a petition.
 */
var logAction = function (data) {
    console.log(data.attributes.action);
};

/**
 * Print out an error.
 */
var logError = function (error) {
    console.error('Error: ' + error.message);
};

var p = new PetitionPager();
p.on('error', logError).on('petition', logAction).on('recent-loaded', function () {
    console.log(p.petitions.length);
}).populateRecent();
