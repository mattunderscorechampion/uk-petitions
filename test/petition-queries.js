
'use strict';

describe("Petition queries", function() {
    var queries = require('../target/js/public/petition-queries'),
        EnrichedPetition = require('../target/js/public/enriched-petition').EnrichedPetition;

    var petition0With5 = {
        id : 0,
        attributes : {
            signature_count : 5
        }
    };
    var petition0With1_005 = {
        id : 0,
        attributes : {
            signature_count : 1005
        }
    };
    var petition0With10_005 = {
        id : 0,
        attributes : {
            signature_count : 10005
        }
    };
    var petition0With100_005 = {
        id : 0,
        attributes : {
            signature_count : 100005
        }
    };
    var petition1With5 = {
        id : 1,
        attributes : {
            signature_count : 5
        }
    };
    var petition1With1_005 = {
        id : 1,
        attributes : {
            signature_count : 1005
        }
    };
    var petition1With10_005 = {
        id : 1,
        attributes : {
            signature_count : 10005
        }
    };
    var petition1With100_005 = {
        id : 1,
        attributes : {
            signature_count : 100005
        }
    };
    var petition2WithoutDebateScheduled = {
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : null
        }
    };
    var petition2WithDebateScheduled = {
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : '2015-10-26'
        }
    };
    var petition2WithDebateScheduledAtLaterDate = {
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : '2015-10-27'
        }
    };
    var petition2WithDebateScheduledAtInvalidDate = {
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : '2015-26-26'
        }
    };

    it('provides predicate for checking that the response threshold has been reached', function() {
        expect(queries.predicates.reachedResponseThreshold).toBeDefined();
        // Raw petition
        expect(queries.predicates.reachedResponseThreshold(petition0With1_005)).toBe(false);
        expect(queries.predicates.reachedResponseThreshold(petition0With10_005)).toBe(true);
        expect(queries.predicates.reachedResponseThreshold(petition0With100_005)).toBe(true);
        // Enriched petition
        expect(queries.predicates.reachedResponseThreshold(new EnrichedPetition(petition0With1_005))).toBe(false);
        expect(queries.predicates.reachedResponseThreshold(new EnrichedPetition(petition0With10_005))).toBe(true);
        expect(queries.predicates.reachedResponseThreshold(new EnrichedPetition(petition0With100_005))).toBe(true);
    });
    it('provides predicate for checking that the debate threshold has been reached', function() {
        expect(queries.predicates.reachedDebateThreshold).toBeDefined();
        // Raw petition
        expect(queries.predicates.reachedDebateThreshold(petition0With1_005)).toBe(false);
        expect(queries.predicates.reachedDebateThreshold(petition0With10_005)).toBe(false);
        expect(queries.predicates.reachedDebateThreshold(petition0With100_005)).toBe(true);
        // Enriched petition
        expect(queries.predicates.reachedDebateThreshold(new EnrichedPetition(petition0With1_005))).toBe(false);
        expect(queries.predicates.reachedDebateThreshold(new EnrichedPetition(petition0With10_005))).toBe(false);
        expect(queries.predicates.reachedDebateThreshold(new EnrichedPetition(petition0With100_005))).toBe(true);
    });
    it('provides predicate for checking that a debate has been scheduled', function() {
        expect(queries.predicates.debateScheduled).toBeDefined();
        // Raw petition
        expect(queries.predicates.debateScheduled(petition2WithoutDebateScheduled)).toBe(false);
        expect(queries.predicates.debateScheduled(petition2WithDebateScheduled)).toBe(true);
        expect(queries.predicates.debateScheduled(petition2WithDebateScheduledAtInvalidDate)).toBe(false);
        // Enriched petition
        expect(queries.predicates.debateScheduled(new EnrichedPetition(petition2WithoutDebateScheduled))).toBe(false);
        expect(queries.predicates.debateScheduled(new EnrichedPetition(petition2WithDebateScheduled))).toBe(true);
        expect(function() {
            queries.predicates.debateScheduled(new EnrichedPetition(petition2WithDebateScheduledAtInvalidDate))
        }).toThrowError();
    });

    it('provides function for checking that the response threshold has been crossed', function() {
        expect(queries.checks.delta.reachedResponseThreshold).toBeDefined();
        // Raw petition
        expect(queries.checks.delta.reachedResponseThreshold(petition0With1_005, petition0With5)).toBe(false);
        expect(queries.checks.delta.reachedResponseThreshold(petition0With10_005, petition0With1_005)).toBe(true);
        expect(queries.checks.delta.reachedResponseThreshold(petition0With100_005, petition0With10_005)).toBe(false);
        expect(function() {
            queries.checks.delta.reachedResponseThreshold(petition0With10_005, petition1With1_005);
        }).toThrowError();
        // Enriched petition
        expect(queries.checks.delta.reachedResponseThreshold(new EnrichedPetition(petition0With1_005), new EnrichedPetition(petition0With5))).toBe(false);
        expect(queries.checks.delta.reachedResponseThreshold(new EnrichedPetition(petition0With10_005), new EnrichedPetition(petition0With1_005))).toBe(true);
        expect(queries.checks.delta.reachedResponseThreshold(new EnrichedPetition(petition0With100_005), new EnrichedPetition(petition0With10_005))).toBe(false);
        expect(function() {
            queries.checks.delta.reachedResponseThreshold(new EnrichedPetition(petition0With10_005), new EnrichedPetition(petition1With1_005));
        }).toThrowError();
    });
    it('provides function for checking that the debate threshold has been crossed', function() {
        expect(queries.checks.delta.reachedDebateThreshold).toBeDefined();
        // Raw petition
        expect(queries.checks.delta.reachedDebateThreshold(petition0With1_005, petition0With5)).toBe(false);
        expect(queries.checks.delta.reachedDebateThreshold(petition0With10_005, petition0With1_005)).toBe(false);
        expect(queries.checks.delta.reachedDebateThreshold(petition0With100_005, petition0With10_005)).toBe(true);
        expect(function() {
            queries.checks.delta.reachedDebateThreshold(petition0With100_005, petition1With10_005);
        }).toThrowError();
        // Enriched petition
        expect(queries.checks.delta.reachedDebateThreshold(new EnrichedPetition(petition0With1_005), new EnrichedPetition(petition0With5))).toBe(false);
        expect(queries.checks.delta.reachedDebateThreshold(new EnrichedPetition(petition0With10_005), new EnrichedPetition(petition0With1_005))).toBe(false);
        expect(queries.checks.delta.reachedDebateThreshold(new EnrichedPetition(petition0With100_005), new EnrichedPetition(petition0With10_005))).toBe(true);
        expect(function() {
            queries.checks.delta.reachedDebateThreshold(new EnrichedPetition(petition0With100_005), new EnrichedPetition(petition1With10_005));
        }).toThrowError();
    });
    it('provides function for checking that a debate has just been scheduled', function() {
        expect(queries.checks.delta.debateScheduled).toBeDefined();
        // Raw petition
        expect(queries.checks.delta.debateScheduled(petition2WithoutDebateScheduled, petition2WithoutDebateScheduled)).toBe(false);
        expect(queries.checks.delta.debateScheduled(petition2WithDebateScheduled, petition2WithoutDebateScheduled)).toBe(true);
        expect(queries.checks.delta.debateScheduled(petition2WithDebateScheduled, petition2WithDebateScheduled)).toBe(false);
        expect(function() {
            queries.checks.delta.debateScheduled(petition1With5, petition2WithDebateScheduled);
        }).toThrowError();
        // Enriched petition
        expect(queries.checks.delta.debateScheduled(new EnrichedPetition(petition2WithoutDebateScheduled), new EnrichedPetition(petition2WithoutDebateScheduled))).toBe(false);
        expect(queries.checks.delta.debateScheduled(new EnrichedPetition(petition2WithDebateScheduled), new EnrichedPetition(petition2WithoutDebateScheduled))).toBe(true);
        expect(queries.checks.delta.debateScheduled(new EnrichedPetition(petition2WithDebateScheduled), new EnrichedPetition(petition2WithDebateScheduled))).toBe(false);
        expect(function() {
            queries.checks.delta.debateScheduled(new EnrichedPetition(petition1With5), new EnrichedPetition(petition2WithDebateScheduled));
        }).toThrowError();
    });
    it('provides function for checking that a debate has been rescheduled', function() {
        expect(queries.checks.delta.debateRescheduled).toBeDefined();
        // Raw petition
        expect(queries.checks.delta.debateRescheduled(petition2WithoutDebateScheduled, petition2WithoutDebateScheduled)).toBe(false);
        expect(queries.checks.delta.debateRescheduled(petition2WithDebateScheduled, petition2WithoutDebateScheduled)).toBe(false);
        expect(queries.checks.delta.debateRescheduled(petition2WithDebateScheduled, petition2WithDebateScheduled)).toBe(false);
        expect(queries.checks.delta.debateRescheduled(petition2WithDebateScheduledAtLaterDate, petition2WithDebateScheduled)).toBe(true);
        expect(function() {
            queries.checks.delta.debateRescheduled(petition1With5, petition2WithDebateScheduled);
        }).toThrowError();
        // Enriched petition
        expect(queries.checks.delta.debateRescheduled(new EnrichedPetition(petition2WithoutDebateScheduled), new EnrichedPetition(petition2WithoutDebateScheduled))).toBe(false);
        expect(queries.checks.delta.debateRescheduled(new EnrichedPetition(petition2WithDebateScheduled), new EnrichedPetition(petition2WithoutDebateScheduled))).toBe(false);
        expect(queries.checks.delta.debateRescheduled(new EnrichedPetition(petition2WithDebateScheduled), new EnrichedPetition(petition2WithDebateScheduled))).toBe(false);
        expect(queries.checks.delta.debateRescheduled(new EnrichedPetition(petition2WithDebateScheduledAtLaterDate), new EnrichedPetition(petition2WithDebateScheduled))).toBe(true);
        expect(function() {
            queries.checks.delta.debateRescheduled(new EnrichedPetition(petition1With5), new EnrichedPetition(petition2WithDebateScheduled));
        }).toThrowError();
    });
});
