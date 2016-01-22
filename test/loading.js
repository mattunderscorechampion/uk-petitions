
'use strict';

describe("Loading", function() {
    var Loading = require('../src/loading');

    it('is an emitter', function() {
        var loading = new Loading();
        expect(loading.emit).toBeDefined();
        expect(loading.on).toBeDefined();
    });
    it('simplifies emitting errors', function() {
        var loading = new Loading();
        expect(loading.error).toBeDefined();
    });
    it('simplifies emitting loaded events', function() {
        var loading = new Loading();
        expect(loading.loaded).toBeDefined();
    });
    it('emits errors', function(done) {
        var loading = new Loading();
        loading.on('error', done);
        loading.error(new Error('Test error'));
    });
    it('emits loaded events', function(done) {
        var loading = new Loading();
        loading.on('loaded', done);
        loading.loaded('data');
    });
});
