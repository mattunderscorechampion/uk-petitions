
'use strict';

var https = require("https"),
    util = require('util'),
    EventEmitter = require('events'),
    PetitionLoader = require('./petition-loader'),
    PetitionPageLoader = require('./petition-page-loader'),
    Latch = require('./latch'),
    LoaderExecutor = require('./loader-executor'),
    petitionUtil = require('./petition-util'),
    equal = require('deep-equal');

var forwardError = petitionUtil.forwardError;

function PetitionPager(loadInterval) {
    EventEmitter.call(this);
    var self = this,
        agent = new https.Agent({ keepAlive: true, maxSockets: 1 }),
        petitionLoader = new PetitionLoader(),
        pageLoader = new PetitionPageLoader(),
        executor = new LoaderExecutor(loadInterval || 500),
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
    this.setPageLoadInterval = function(newInterval) {
        executor.setInterval(newInterval);
        return self;
    };

    var internalLoadPage = function(page, emitter, filter) {
        var loadDetailProvider = function(latch) {
            return function(summary) {
                executor.execute(function() {
                    if (filter && filter(summary, self.petitions)) {
                        // Skip
                        latch.release();
                        return;
                    }

                    petitionLoader
                        .load(summary.id)
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
        };

        var onPageLoaded = function(summary) {
            var latch = new Latch(summary.data.length);
            latch.onRelease(function () {
                emitter.emit('page-loaded', summary);
            });
            summary.data.forEach(loadDetailProvider(latch));
        };

        executor.execute(function() {
            pageLoader
                .load(page)
                .on('loaded', onPageLoaded)
                .on('error', forwardError(self));
        });
    };

    this.populateAll = function () {
        return self.populate(function() {
            return true;
        });
    };

    this.populateOpen = function () {
        return self.populate(function(summary) {
            return summary.attributes.state === 'open';
        });
    };

    this.populateInteresting = function () {
        return self.populate(function(summary) {
            return summary.attributes.state !== 'rejected' && summary.attributes.state !== 'closed';
        });
    };

    this.populateHot = function () {
        var emitter = new EventEmitter();
        emitter.on('page-loaded', function() {
            self.emit('loaded', self);
        });
        internalLoadPage(1, emitter);
        return self;
    };

    this.populate = function (filter) {
        var emitter = new EventEmitter();

        // Load the next page
        var loadNextPage = function (data) {
            if (data.links.next !== null) {
                var index = data.links.next.lastIndexOf('/'),
                    nextPath = data.links.next.substring(index);
                    internalLoadPage(nextPath, emitter, filter);
            }
            else {
                self.emit('loaded', self);
            }
        };

        emitter.on('page-loaded', loadNextPage);
        internalLoadPage('/petitions.json?page=1&state=all', emitter, filter);

        return self;
    };
}
util.inherits(PetitionPager, EventEmitter);

module.exports = PetitionPager;
