
'use strict';

describe("Loading", function() {
    var Loading = require('../src/loading'),
        EventEmitter = require('events');

    it('is an emitter', function() {
        var loading = new Loading();
        expect(loading.emit).toBeDefined();
        expect(loading.on).toBeDefined();
    });
    it('simplifies emitting errors', function() {
        var loading = new Loading();
        expect(loading.error).toBeDefined();
        expect(loading.onError).toBeDefined();
    });
    it('simplifies emitting loaded events', function() {
        var loading = new Loading();
        expect(loading.loaded).toBeDefined();
        expect(loading.onLoaded).toBeDefined();
    });
    it('emits errors', function(done) {
        var loading = new Loading();
        loading.onError(done);
        loading.error(new Error('Test error'));
    });
    it('emits loaded events', function(done) {
        var loading = new Loading();
        loading.onLoaded(done);
        loading.loaded('data');
    });
    it('can forward errors', function(done) {
        var loading = new Loading();
        loading.onError(done);
        var sourceEmitter = new EventEmitter();
        loading.forwardErrors(sourceEmitter);
        sourceEmitter.emit('error', new Error('Test error'));
    });
});
