
'use strict';

var preconditions = {
    samePetitionId : function(petition0, petition1) {
        if (!checks.samePetitionId(petition0, petition1)) {
            throw new Error('Petition IDs should be the same but are different');
        }
    }
};

function reachedSignatureCount(targetSignatureCount, petition) {
    return petition.attributes.signature_count >= targetSignatureCount;
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

function debateScheduled(data) {
    if (data.attributes.scheduled_debate_date) {
        var date = new Date(data.attributes.scheduled_debate_date);
        return !isNaN(date);
    }
    return false;
}

function deltaCheck(predicate, newData, oldData) {
    preconditions.samePetitionId(oldData, newData);
    return predicate(newData) && !predicate(oldData);
}

function reachedSignatureDeltaCountProvider(targetSignatureCount) {
    return deltaCheck.bind(null, reachedSignatureCount.bind(null, targetSignatureCount));
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
        reachedSignatureDeltaCountProvider : reachedSignatureDeltaCountProvider,
        debateScheduled : deltaCheck.bind(null, debateScheduled)
    }
};

module.exports = {
    /**
     * Predicates that can be used to evaluate petitions.
     * @namespace
     */
    predicates : {
        reached10 : reachedSignatureCount.bind(null, 10),
        reached20 : reachedSignatureCount.bind(null, 20),
        reached50 : reachedSignatureCount.bind(null, 50),
        reached100 : reachedSignatureCount.bind(null, 100),
        reached250 : reachedSignatureCount.bind(null, 250),
        reached500 : reachedSignatureCount.bind(null, 500),
        reached1_000 : reachedSignatureCount.bind(null, 1000),
        reached5_000 : reachedSignatureCount.bind(null, 5000),
        reached10_000 : reachedSignatureCount.bind(null, 10000),
        reached50_000 : reachedSignatureCount.bind(null, 50000),
        reached100_000 : reachedSignatureCount.bind(null, 100000),
        reached500_000 : reachedSignatureCount.bind(null, 500000),
        /**
         * Predicate that tests if the number of signatures required for a response has been reached.
         * @function
         * @param {Petition} petition - A petition
         */
        reachedResponseThreshold : reachedSignatureCount.bind(null, 10000),
        /**
         * Predicate that tests if the number of signatures required for a debate has been reached.
         * @function
         * @param {Petition} petition - A petition
         */
        reachedDebateThreshold : reachedSignatureCount.bind(null, 100000),
        governmentResponded : governmentResponded,
        /**
         * Predicate that tests if the petition has been debated.
         * @function
         * @param {Petition} petition - A petition
         */
        debated : debated,
        /**
         * Predicate that tests if the petition has been debated and a transcript is available.
         * @function
         * @param {Petition} petition - A petition
         */
        debateTranscriptAvailable : debateTranscriptAvailable,
        /**
         * Predicate that tests if the petition has been scheduled for debate.
         * @function
         * @param {Petition} petition - A petition
         */
        debateScheduled : debateScheduled
    },
    /**
     * Functions that can be used to check and compare petitions.
     * @namespace
     */
    checks : checks
};
