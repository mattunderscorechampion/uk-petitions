
/// <reference path="../node.d.ts" />

import enriched = require('./enriched-petition');

var samePetitionId = function(petition0: enriched.UkPetitions.EnrichedPetition, petition1: enriched.UkPetitions.EnrichedPetition) {
    return petition0.id === petition1.id;
}

var samePetitionIdPreconditionI = function(petition0, petition1) {
    if (!samePetitionId(petition0, petition1)) {
        throw new Error('Petition IDs should be the same but are different');
    }
}

var isEnrichedI = function(petition) {
    return petition instanceof enriched.UkPetitions.EnrichedPetition;
}

var reachedSignatureCountI = function(targetSignatureCount, petition) {
    if (isEnrichedI(petition)) {
        return petition.signature_count >= targetSignatureCount;
    }
    else {
        return petition.attributes.signature_count >= targetSignatureCount;
    }
}

var governmentRespondedI = function(petition) {
    if (isEnrichedI(petition)) {
        return petition.government_response !== null;
    }
    else {
        return petition.attributes.government_response !== null;
    }
}

var debatedI = function(petition) {
    if (isEnrichedI(petition)) {
        return petition.debate !== null;
    }
    else {
        return petition.attributes.debate !== null;
    }
}

var debateTranscriptAvailableI = function(petition) {
    if (isEnrichedI(petition)) {
        return petition.debate !== null && petition.debate.transcript_url !== null;
    }
    else {
        return petition.attributes.debate !== null && petition.attributes.debate.transcript_url !== null;
    }
}

var debateScheduledI = function(petition): boolean {
    if (isEnrichedI(petition)) {
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

var debateRescheduledI = function(newPetition, oldPetition) {
    samePetitionIdPreconditionI(newPetition, oldPetition);
    if (isEnrichedI(newPetition) && isEnrichedI(oldPetition)) {
        return debateScheduledI(newPetition) && debateScheduledI(oldPetition) && newPetition.scheduled_debate_date.valueOf() !== oldPetition.scheduled_debate_date.valueOf();
    }
    else {
        return debateScheduledI(newPetition) && debateScheduledI(oldPetition) && newPetition.attributes.scheduled_debate_date !== oldPetition.attributes.scheduled_debate_date;
    }
}

var deltaCheckI = function(predicate, newData, oldData) {
    samePetitionIdPreconditionI(oldData, newData);
    return predicate(newData) && !predicate(oldData);
}

var reachedSignatureDeltaCountProviderI = function(targetSignatureCount: number): {(petition: any): boolean;} {
    return deltaCheckI.bind(null, reachedSignatureCountI.bind(null, targetSignatureCount));
}

var governmentRespondedCheckI = function(newData, oldData) {
    samePetitionIdPreconditionI(oldData, newData);
    return governmentRespondedI(newData) && !governmentRespondedI(oldData);
}

var debatedCheckI = function(newData, oldData) {
    samePetitionIdPreconditionI(oldData, newData);
    return debatedI(newData) && !debatedI(oldData);
}

var debateTranscriptAvailableCheckI = function(newData, oldData) {
    samePetitionIdPreconditionI(oldData, newData);
    return debateTranscriptAvailableI(newData) && !debateTranscriptAvailableI(oldData);
}

export module UkPetitions {

    /**
     * Predicates that can be used to evaluate petitions.
     */
    export module predicates {
        export var reached10 = reachedSignatureCountI.bind(null, 10);
        export var reached20 = reachedSignatureCountI.bind(null, 20);
        export var reached50 = reachedSignatureCountI.bind(null, 50);
        export var reached100 = reachedSignatureCountI.bind(null, 100);
        export var reached250 = reachedSignatureCountI.bind(null, 250);
        export var reached500 = reachedSignatureCountI.bind(null, 500);
        export var reached1_000 = reachedSignatureCountI.bind(null, 1000);
        export var reached5_000 = reachedSignatureCountI.bind(null, 5000);
        export var reached10_000 = reachedSignatureCountI.bind(null, 10000);
        export var reached50_000 = reachedSignatureCountI.bind(null, 50000);
        export var reached100_000 = reachedSignatureCountI.bind(null, 100000);
        export var reached500_000 = reachedSignatureCountI.bind(null, 500000);
        /**
         * Predicate that tests if the number of signatures required for a response has been reached.
         * @function
         * @param {Petition} petition - A petition
         */
        export var reachedResponseThreshold = reachedSignatureCountI.bind(null, 10000);
        /**
         * Predicate that tests if the number of signatures required for a debate has been reached.
         * @function
         * @param {Petition} petition - A petition
         */
        export var reachedDebateThreshold = reachedSignatureCountI.bind(null, 100000);
        /**
         * Predicate that tests if the government has responded to the petition.
         * @function
         * @param {Petition} petition - A petition
         */
        export var governmentResponded = governmentRespondedI;
        /**
         * Predicate that tests if the petition has been debated.
         * @function
         * @param {Petition} petition - A petition
         */
        export var debated = debatedI;
        /**
         * Predicate that tests if the petition has been debated and a transcript is available.
         * @function
         * @param {Petition} petition - A petition
         */
        export var debateTranscriptAvailable = debateTranscriptAvailableI;
        /**
         * Predicate that tests if the petition has been scheduled for debate.
         * @function
         * @param {Petition} petition - A petition
         */
        export var debateScheduled = debateScheduledI;
    }

    /**
     * Functions that can be used to check and compare petitions.
     */
    export module checks {
        /**
         * Function that tests if two petitons have the same ID.
         * @function
         * @param {Petition} petition0 - A petition
         * @param {Petition} petition1 - A petition
         */
        export var samePetition = samePetitionId;
        /**
         * Delta checks. Checks between two snapshots of the same petition.
         */
        export module delta {
            export var reached10 = reachedSignatureDeltaCountProviderI(10);
            export var reached20 = reachedSignatureDeltaCountProviderI(20);
            export var reached50 = reachedSignatureDeltaCountProviderI(50);
            export var reached100 = reachedSignatureDeltaCountProviderI(100);
            export var reached250 = reachedSignatureDeltaCountProviderI(250);
            export var reached500 = reachedSignatureDeltaCountProviderI(500);
            export var reached1_000 = reachedSignatureDeltaCountProviderI(1000);
            export var reached5_000 = reachedSignatureDeltaCountProviderI(5000);
            export var reached10_000 = reachedSignatureDeltaCountProviderI(10000);
            export var reached50_000 = reachedSignatureDeltaCountProviderI(50000);
            export var reached100_000 = reachedSignatureDeltaCountProviderI(100000);
            export var reached500_000 = reachedSignatureDeltaCountProviderI(500000);
            export var reachedResponseThreshold = reachedSignatureDeltaCountProviderI(10000);
            export var reachedDebateThreshold = reachedSignatureDeltaCountProviderI(100000);
            /**
             * Function that tests if the government has responded since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export var governmentResponded = governmentRespondedCheckI;
            /**
             * Function that tests if a petition has been debated since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export var debated = debatedCheckI;
            /**
             * Function that tests if a debate transcript has become available since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export var debateTranscriptAvailable = debateTranscriptAvailableCheckI;
            export var reachedSignatureDeltaCountProvider = reachedSignatureDeltaCountProviderI;
            /**
             * Function that tests if a debate on a petition has been scheduled since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export var debateScheduled = deltaCheckI.bind(null, debateScheduledI);
            /**
             * Function that tests if a debate on a petition has been rescheduled since the first snapshot.
             * @function
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export var debateRescheduled = debateRescheduledI;
        }
    }

}
