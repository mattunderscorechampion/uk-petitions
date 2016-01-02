
'use strict';

var preconditions = {
    samePetitionId : function(petition0, petition1) {
        if (!checks.samePetitionId(petition0, petition1)) {
            throw new Error('Petition IDs should be the same but are different');
        }
    }
};

function reachedSignatureCountProvider(targetSignatureCount) {
    return function(data) {
        return data.attributes.signature_count >= targetSignatureCount;
    };
}

function reachedSignatureDeltaCountProvider(targetSignatureCount) {
    var predicate = reachedSignatureCountProvider(targetSignatureCount);
    return function(newData, oldData) {
        preconditions.samePetitionId(oldData, newData);
        return predicate(newData) && !predicate(oldData);
    };
}

function governmentResponded(data) {
    return data.attributes.government_response !== null;
}

function debated(data) {
    return data.attributes.debate !== null;
}

function debateTranscriptAvailable(data) {
    return data.attributes.debate !== null && data.attributes.debate.transcript_url !== null;
}

var checks = {
    samePetitionId : function(petition0, petition1) {
        return petition0.id === petition1.id;
    },
    delta : {
        reached10 : reachedSignatureDeltaCountProvider(10),
        reached20 : reachedSignatureDeltaCountProvider(20),
        reached50 : reachedSignatureDeltaCountProvider(50),
        reached100 : reachedSignatureDeltaCountProvider(100),
        reached250 : reachedSignatureDeltaCountProvider(250),
        reached500 : reachedSignatureDeltaCountProvider(500),
        reached1_000 : reachedSignatureDeltaCountProvider(1000),
        reached5_000 : reachedSignatureDeltaCountProvider(5000),
        reached10_000 : reachedSignatureDeltaCountProvider(10000),
        reached50_000 : reachedSignatureDeltaCountProvider(50000),
        reached100_000 : reachedSignatureDeltaCountProvider(100000),
        reached500_000 : reachedSignatureDeltaCountProvider(500000),
        reachedResponseThreshold : reachedSignatureDeltaCountProvider(10000),
        reachedDebateThreshold : reachedSignatureDeltaCountProvider(100000),
        governmentResponded : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return governmentResponded(newData) && !governmentResponded(oldData);
        },
        debated : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return debated(newData) && !debated(oldData);
        },
        debateTranscriptAvailable : function(newData, oldData) {
            preconditions.samePetitionId(oldData, newData);
            return debateTranscriptAvailable(newData) && !debateTranscriptAvailable(oldData);
        },
        reachedSignatureDeltaCountProvider : reachedSignatureDeltaCountProvider
    }
};

module.exports = {
    /**
     * Predicates that can be used to evaluate petitions.
     * @namespace
     */
    predicates : {
        reached10 : reachedSignatureCountProvider(10),
        reached20 : reachedSignatureCountProvider(20),
        reached50 : reachedSignatureCountProvider(50),
        reached100 : reachedSignatureCountProvider(100),
        reached250 : reachedSignatureCountProvider(250),
        reached500 : reachedSignatureCountProvider(500),
        reached1_000 : reachedSignatureCountProvider(1000),
        reached5_000 : reachedSignatureCountProvider(5000),
        reached10_000 : reachedSignatureCountProvider(10000),
        reached50_000 : reachedSignatureCountProvider(50000),
        reached100_000 : reachedSignatureCountProvider(100000),
        reached500_000 : reachedSignatureCountProvider(500000),
        reachedResponseThreshold : reachedSignatureCountProvider(10000),
        reachedDebateThreshold : reachedSignatureCountProvider(100000),
        governmentResponded : governmentResponded,
        debated : debated,
        debateTranscriptAvailable : debateTranscriptAvailable
    },
    /**
     * Functions that can be used to check and compare petitions.
     * @namespace
     */
    checks : checks
};
