
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
    it('has predefined queries', function() {
        expect(petitions.queries).toBeDefined();
    });
    it('has predefined checks', function() {
        expect(petitions.queries.checks).toBeDefined();
    });
    it('has predefined delta checks', function() {
        expect(petitions.queries.checks.delta).toBeDefined();
    });
    it('supports checking a petition has reached a number of signatures', function() {
        expect(petitions.queries.checks.delta.reachedSignatureDeltaCountProvider).toBeDefined();
    });
    it('has predefined output', function() {
        expect(petitions.output).toBeDefined();
    });
});
