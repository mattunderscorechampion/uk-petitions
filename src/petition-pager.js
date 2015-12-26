
'use strict';

var https = require("https"),
    util = require('util'),
    EventEmitter = require('events'),
    PetitionLoader = require('./petition-loader'),
    PetitionPageLoader = require('./petition-page-loader'),
    Latch = require('./latch'),
    petitionUtil = require('./petition-util'),
    equal = require('deep-equal');

var forwardError = petitionUtil.forwardError;

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

module.exports = PetitionPager;
