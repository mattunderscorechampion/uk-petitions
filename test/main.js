
'use strict';

var petitions = require('..');

describe("petitions", function() {
    it('has monitor', function() {
        expect(petitions.PetitionsMonitor).toBeDefined();
    });
    it('has petition loader', function() {
        expect(petitions.PetitionLoader).toBeDefined();
    });
    it('has page loader', function() {
        expect(petitions.PetitionPageLoader).toBeDefined();
    });
    it('has pager', function() {
        expect(petitions.PetitionPager).toBeDefined();
    });
    it('has self running monitor', function() {
        expect(petitions.monitor).toBeDefined();
    });
    it('has predefined queries', function() {
        expect(petitions.queries).toBeDefined();
    });
    it('has predefined output', function() {
        expect(petitions.output).toBeDefined();
    });
});
