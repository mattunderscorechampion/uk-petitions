
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
        export function reached10(petition: any): boolean {
            return reachedSignatureCountI(10, petition);
        }
        export function reached20(petition: any): boolean {
            return reachedSignatureCountI(20, petition);
        }
        export function reached50(petition: any): boolean {
            return reachedSignatureCountI(50, petition);
        }
        export function reached100(petition: any): boolean {
            return reachedSignatureCountI(100, petition);
        }
        export function reached250(petition: any): boolean {
            return reachedSignatureCountI(250, petition);
        }
        export function reached500(petition: any): boolean {
            return reachedSignatureCountI(500, petition);
        }
        export function reached1_000(petition: any): boolean {
            return reachedSignatureCountI(1000, petition);
        }
        export function reached5_000(petition: any): boolean {
            return reachedSignatureCountI(5000, petition);
        }
        export function reached10_000(petition: any): boolean {
            return reachedSignatureCountI(10000, petition);
        }
        export function reached50_000(petition: any): boolean {
            return reachedSignatureCountI(50000, petition);
        }
        export function reached100_000(petition: any): boolean {
            return reachedSignatureCountI(100000, petition);
        }
        export function reached500_000(petition: any): boolean {
            return reachedSignatureCountI(500000, petition);
        }
        /**
         * Predicate that tests if the number of signatures required for a response has been reached.
         * @param {Petition} petition - A petition
         */
        export function reachedResponseThreshold(petition: any): boolean {
            return reachedSignatureCountI(10000, petition);
        }
        /**
         * Predicate that tests if the number of signatures required for a debate has been reached.
         * @param {Petition} petition - A petition
         */
        export function reachedDebateThreshold(petition: any): boolean {
            return reachedSignatureCountI(100000, petition);
        }
        /**
         * Predicate that tests if the government has responded to the petition.
         * @param {Petition} petition - A petition
         */
        export function governmentResponded(petition: any): boolean {
            return governmentRespondedI(petition);
        }
        /**
         * Predicate that tests if the petition has been debated.
         * @param {Petition} petition - A petition
         */
        export function debated(petition: any): boolean {
            return debatedI(petition);
        }
        /**
         * Predicate that tests if the petition has been debated and a transcript is available.
         * @param {Petition} petition - A petition
         */
        export function debateTranscriptAvailable(petition: any): boolean {
            return debateTranscriptAvailableI(petition);
        }
        /**
         * Predicate that tests if the petition has been scheduled for debate.
         * @param {Petition} petition - A petition
         */
        export function debateScheduled(petition: any): boolean {
            return debateScheduledI(petition);
        }
    }

    /**
     * Functions that can be used to check and compare petitions.
     */
    export module checks {
        /**
         * Function that tests if two petitons have the same ID.
         * @param {Petition} petition0 - A petition
         * @param {Petition} petition1 - A petition
         */
        export function samePetition(petition0: any, petition1: any): boolean {
            return samePetitionId(petition0, petition1);
        }
        /**
         * Delta checks. Checks between two snapshots of the same petition.
         */
        export module delta {
            export function reached10(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 10), newData, oldData);
            }
            export function reached20(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 20), newData, oldData);
            }
            export function reached50(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 50), newData, oldData);
            }
            export function reached100(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 100), newData, oldData);
            }
            export function reached250(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 250), newData, oldData);
            }
            export function reached500(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 500), newData, oldData);
            }
            export function reached1_000(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 1000), newData, oldData);
            }
            export function reached5_000(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 5000), newData, oldData);
            }
            export function reached10_000(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 10000), newData, oldData);
            }
            export function reached50_000(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 50000), newData, oldData);
            }
            export function reached100_000(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 100000), newData, oldData);
            }
            export function reached500_000(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 500000), newData, oldData);
            }
            export function reachedResponseThreshold(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 10000), newData, oldData);
            }
            export function reachedDebateThreshold(newData: any, oldData: any): boolean {
                return deltaCheckI(reachedSignatureCountI.bind(null, 100000), newData, oldData);
            }
            /**
             * Function that tests if the government has responded since the first snapshot.
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export function governmentResponded(newData: any, oldData: any): boolean {
                return governmentRespondedCheckI(newData, oldData);
            }
            /**
             * Function that tests if a petition has been debated since the first snapshot.
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export function debated(newData: any, oldData: any): boolean {
                return debatedCheckI(newData, oldData);
            }
            /**
             * Function that tests if a debate transcript has become available since the first snapshot.
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export function debateTranscriptAvailable(newData: any, oldData: any): boolean {
                return debateTranscriptAvailableCheckI(newData, oldData);
            }
            export function reachedSignatureDeltaCountProvider(count: number): {(petition: any): boolean;} {
                return reachedSignatureDeltaCountProviderI(count);
            }
            /**
             * Function that tests if a debate on a petition has been scheduled since the first snapshot.
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export function debateScheduled(newData: any, oldData: any): boolean {
                return deltaCheckI(debateScheduledI, newData, oldData);
            }
            /**
             * Function that tests if a debate on a petition has been rescheduled since the first snapshot.
             * @param {Petition} newData - The latest data
             * @param {Petition} oldData - The older data
             */
            export function debateRescheduled(newData: any, oldData: any): boolean {
                return debateRescheduledI(newData, oldData);
            }
        }
    }

}
