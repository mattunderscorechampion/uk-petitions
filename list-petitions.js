
'use strict';

var https = require("https"),
    util = require('util'),
    EventEmitter = require('events'),
    equal = require('deep-equal');

/**
 * A simple latch that can be released once.  Release may need to be called
 * muliple times before the latch is released.
 */
function Latch(num) {
    var number = num, callbacks = [];

    this.release = function () {
        if (number > 0) {
            number = number - 1;
            if (number === 0) {
                callbacks.forEach(function (callback) {
                    callback();
                });
            }
        }
    };

    this.onRelease = function (callback) {
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
            res
                .on('data', function (d) {
                    buffers.push(d);
                })
                .on('end', function () {
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

function PetitionPager() {
    EventEmitter.call(this);
    var self = this,
        agent = new https.Agent({ keepAlive: true, maxSockets: 1 }),
        petitionLoader = new PetitionLoader(),
        pageLoader = new PetitionPageLoader(),
        setPetitionData = function (data) {
            var oldData = self.petitions[data.id];
            if (oldData) {
                // Replace with changed data
                if (!equal(oldData, data)) {
                    self.petitions[data.id] = data;
                    self.emit('petition', data, oldData);
                }
            } else {
                // Add new data
                self.petitions[data.id] = data;
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
            var latch = new Latch(data.data.length);
            latch.onRelease(function () {
                if (data.links.next !== null) {
                    var index = data.links.next.lastIndexOf('/'),
                        nextPath = data.links.next.substring(index);
                    pageLoader
                        .load(nextPath)
                        .on('loaded', loadNextPage);
                } else {
                    self.emit('all-loaded', self);
                }
            });
            data.data.forEach(function (data) {
                petitionLoader
                    .load(data.id)
                    .on('error', function (error) {
                        self.emit('error', error);
                        latch.release();
                    })
                    .on('loaded', function (data) {
                        setPetitionData(data);
                        latch.release();
                    });
            });
        };

        // Load first page
        pageLoader
            .load(1)
            .on('loaded', loadNextPage)
            .on('error', forwardError(self));

        return self;
    };

    this.populateRecent = function () {
        // Load first page
        pageLoader.load(1).on('loaded', function (data) {
            var latch = new Latch(data.data.length);
            latch.onRelease(function () {
                self.emit('recent-loaded', self);
            });
            data.data.forEach(function (data) {
                petitionLoader
                    .load(data.id)
                    .on('error', function (error) {
                        self.emit('error', error);
                        latch.release();
                    })
                    .on('loaded', function (data) {
                        setPetitionData(data);
                        latch.release();
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

var logWithTop5Countries = function (data) {
    console.log('Action: %s', data.attributes.action);
    console.log('Top 5 countries:');
    var total_signatures = data.attributes.signature_count;
    data.attributes.signatures_by_country
        .slice()
        .sort(function(country0, country1) {
            return country1.signature_count - country0.signature_count;
        })
        .slice(0, Math.min(5, data.attributes.signatures_by_country.length))
        .forEach(function (pair) {
            var percentage = (pair.signature_count / total_signatures) * 100;
            console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
        });
};

var logWithSignatureCount = function (data) {
    console.log('Action: %s', data.attributes.action);
    console.log('Signatures: %d', data.attributes.signature_count);
};

var logWithSignatureCountDiff = function (data, oldData) {
    if (oldData) {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d (was %d)', data.attributes.signature_count, oldData.attributes.signature_count);
    }
    else {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d', data.attributes.signature_count);
    }
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

var petitions = {
    preconditions : {
        samePetitionId : function(petition0, petition1) {
            if (!petitions.predicates.samePetitionId(petition0, petition1)) {
                throw new Error('Petition IDs should be the same but are different');
            }
        }
    },
    predicates : {
        samePetitionId : function(petition0, petition1) {
            return petition0.id === petition1.id;
        },
        delta : {
            goneOver10_000 : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                return newData.attributes.signature_count >= 10000 && oldData.attributes.signature_count < 10000;
            },
            goneOver100_000 : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                return newData.attributes.signature_count >= 100000 && oldData.attributes.signature_count < 100000;
            },
            governmentResponded : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                return newData.attributes.government_response !== null && oldData.attributes.government_response === null;
            },
            debated : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                return newData.attributes.debate !== null && oldData.attributes.debate === null;
            }
        }
    }
};

var p = new PetitionPager();
p.on('error', logError)
    .on('petition', logWithSignatureCountDiff)
    .on('recent-loaded', function () {
        // Check the first page for any changes
        p.populateRecent();
    })
    .populateRecent();
