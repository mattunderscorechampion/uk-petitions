
'use strict';

describe("Latch", function() {
    var Latch = require('../target/js/latch').Latch;

    it('released if no count down', function(done) {
        var latch = new Latch(0);
        latch.onRelease(done);
    });
    it('released after count down', function(done) {
        var latch = new Latch(1);
        latch.onRelease(done);
        latch.release();
    });
    it('stays released after count down', function(done) {
        var latch = new Latch(1);
        latch.release();
        latch.onRelease(done);
    });
    it('released after long count down', function(done) {
        var latch = new Latch(2);
        latch.onRelease(done);
        latch.release();
        latch.release();
    });
    it('stays released after long count down', function(done) {
        var latch = new Latch(2);
        latch.release();
        latch.release();
        latch.onRelease(done);
    });
});
