
/// <reference path="../node.d.ts" />
/// <reference path="./raw-petition.d.ts" />

import enriched = require('./enriched-petition');

function samePetitionId(petition0: enriched.EnrichedPetition, petition1: enriched.EnrichedPetition) {
    return petition0.id === petition1.id;
}

function samePetitionIdPrecondition(petition0, petition1) {
    if (!samePetitionId(petition0, petition1)) {
        throw new Error('Petition IDs should be the same but are different');
    }
}

var preconditions = {
    samePetitionId : samePetitionIdPrecondition
};

function isEnriched(petition) {
    return petition instanceof enriched.EnrichedPetition;
}

function reachedSignatureCount(targetSignatureCount, petition) {
    if (isEnriched(petition)) {
        return petition.signature_count >= targetSignatureCount;
    }
    else {
        return petition.attributes.signature_count >= targetSignatureCount;
    }
}

function governmentResponded(petition) {
    if (isEnriched(petition)) {
        return petition.government_response !== null;
    }
    else {
        return petition.attributes.government_response !== null;
    }
}

function debated(petition) {
    if (isEnriched(petition)) {
        return petition.debate !== null;
    }
    else {
        return petition.attributes.debate !== null;
    }
}

function debateTranscriptAvailable(petition) {
    if (isEnriched(petition)) {
        return petition.debate !== null && petition.debate.transcript_url !== null;
    }
    else {
        return petition.attributes.debate !== null && petition.attributes.debate.transcript_url !== null;
    }
}

function debateScheduled(petition): boolean {
    if (isEnriched(petition)) {
        return petition.scheduled_debate_date !== null;
    }
    else {
        if (petition.attributes.scheduled_debate_date) {
            var date: Date = new Date(petition.attributes.scheduled_debate_date);
            return !isNaN(date.getTime());
        }
        return false;
    }
}

function debateRescheduled(newPetition, oldPetition) {
    preconditions.samePetitionId(newPetition, oldPetition);
    if (isEnriched(newPetition) && isEnriched(oldPetition)) {
        return debateScheduled(newPetition) && debateScheduled(oldPetition) && newPetition.scheduled_debate_date.valueOf() !== oldPetition.scheduled_debate_date.valueOf();
    }
    else {
        return debateScheduled(newPetition) && debateScheduled(oldPetition) && newPetition.attributes.scheduled_debate_date !== oldPetition.attributes.scheduled_debate_date;
    }
}

function deltaCheck(predicate, newData, oldData) {
    preconditions.samePetitionId(oldData, newData);
    return predicate(newData) && !predicate(oldData);
}

function reachedSignatureDeltaCountProvider(targetSignatureCount) {
    return deltaCheck.bind(null, reachedSignatureCount.bind(null, targetSignatureCount));
}

function governmentRespondedCheck(newData, oldData) {
    preconditions.samePetitionId(oldData, newData);
    return governmentResponded(newData) && !governmentResponded(oldData);
}

function debatedCheck(newData, oldData) {
    preconditions.samePetitionId(oldData, newData);
    return debated(newData) && !debated(oldData);
}

function debateTranscriptAvailableCheck(newData, oldData) {
    preconditions.samePetitionId(oldData, newData);
    return debateTranscriptAvailable(newData) && !debateTranscriptAvailable(oldData);
}

export = {
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
        /**
         * Predicate that tests if the government has responded to the petition.
         * @function
         * @param {Petition} petition - A petition
         */
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
    checks : {
        /**
         * Function that tests if two petitons have the same ID.
         * @function
         * @param {Petition} petition0 - A petition
         * @param {Petition} petition1 - A petition
         */
        samePetitionId : samePetitionId,
        /**
         * Delta checks. Checks between two snapshots of the same petition.
         * @namespace
         */
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
            /**
             * Function that tests if the government has responded since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            governmentResponded : governmentRespondedCheck,
            /**
             * Function that tests if a petition has been debated since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            debated : debatedCheck,
            /**
             * Function that tests if a debate transcript has become available since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            debateTranscriptAvailable : debateTranscriptAvailableCheck,
            reachedSignatureDeltaCountProvider : reachedSignatureDeltaCountProvider,
            /**
             * Function that tests if a debate on a petition has been scheduled since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            debateScheduled : deltaCheck.bind(null, debateScheduled),
            /**
             * Function that tests if a debate on a petition has been rescheduled since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            debateRescheduled : debateRescheduled
        }
    }
};