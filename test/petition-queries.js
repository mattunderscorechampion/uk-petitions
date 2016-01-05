
describe("Petition queries", function() {
    var queries = require('../src/petition-queries');

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

    it('provides predicate for checking that the response threshold has been reached', function() {
        expect(queries.predicates.reachedResponseThreshold).toBeDefined();
        expect(queries.predicates.reachedResponseThreshold(petition0With1_005)).toBe(false);
        expect(queries.predicates.reachedResponseThreshold(petition0With10_005)).toBe(true);
        expect(queries.predicates.reachedResponseThreshold(petition0With100_005)).toBe(true);
    });
    it('provides predicate for checking that the debate threshold has been reached', function() {
        expect(queries.predicates.reachedDebateThreshold).toBeDefined();
        expect(queries.predicates.reachedDebateThreshold(petition0With1_005)).toBe(false);
        expect(queries.predicates.reachedDebateThreshold(petition0With10_005)).toBe(false);
        expect(queries.predicates.reachedDebateThreshold(petition0With100_005)).toBe(true);
    });
    it('provides function for checking that the response threshold has been crossed', function() {
        expect(queries.checks.delta.reachedResponseThreshold).toBeDefined();
        expect(queries.checks.delta.reachedResponseThreshold(petition0With1_005, petition0With5)).toBe(false);
        expect(queries.checks.delta.reachedResponseThreshold(petition0With10_005, petition0With1_005)).toBe(true);
        expect(queries.checks.delta.reachedResponseThreshold(petition0With100_005, petition0With10_005)).toBe(false);
        expect(function() {
            queries.checks.delta.reachedResponseThreshold(petition0With10_005, petition1With1_005);
        }).toThrowError();
    });
    it('provides function for checking that the debate threshold has been crossed', function() {
        expect(queries.checks.delta.reachedDebateThreshold).toBeDefined();
        expect(queries.checks.delta.reachedDebateThreshold(petition0With1_005, petition0With5)).toBe(false);
        expect(queries.checks.delta.reachedDebateThreshold(petition0With10_005, petition0With1_005)).toBe(false);
        expect(queries.checks.delta.reachedDebateThreshold(petition0With100_005, petition0With10_005)).toBe(true);
        expect(function() {
            queries.checks.delta.reachedDebateThreshold(petition0With100_005, petition1With10_005);
        }).toThrowError();
    });
});
