
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

    var internalLoadPage = function(page, emitter) {
        pageLoader.load(page).on('loaded', function (data) {
            var latch = new Latch(data.data.length);
            latch.onRelease(function () {
                emitter.emit('page-loaded', data);
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
    };

    this.populateAll = function () {
        var emitter = new EventEmitter();

        // Load the next page
        var loadNextPage = function (data) {
            if (data.links.next !== null) {
                var index = data.links.next.lastIndexOf('/'),
                    nextPath = data.links.next.substring(index);
                    internalLoadPage(nextPath, emitter);
            }
            else {
                self.emit('all-loaded', self);
            }
        };

        emitter.on('page-loaded', loadNextPage);
        internalLoadPage(1, emitter);

        return self;
    };

    this.populateOpen = function () {
        var emitter = new EventEmitter();

        // Load the next page
        var loadNextPage = function (data) {
            if (data.links.next !== null) {
                var index = data.links.next.lastIndexOf('/'),
                    nextPath = data.links.next.substring(index);
                    internalLoadPage(nextPath, emitter);
            }
            else {
                self.emit('open-loaded', self);
            }
        };

        emitter.on('page-loaded', loadNextPage);
        internalLoadPage('/petitions.json?page=1&state=open', emitter);

        return self;
    };

    this.populateHot = function () {
        var emitter = new EventEmitter();
        emitter.on('page-loaded', function() {
            self.emit('recent-loaded', self);
        });
        internalLoadPage(1, emitter);
        return self;
    };
}
util.inherits(PetitionPager, EventEmitter);

module.exports = PetitionPager;
