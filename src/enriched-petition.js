
function stringToDate(dateString) {
    if (dateString) {
        var date = new Date(dateString);
        if (isNaN(date)) {
            throw new Error('A date string of the petition could not be parsed');
        }
        return date;
    }
    else {
        return null;
    }
}

var keysToTransform = {
    created_at : stringToDate,
    government_response_at : stringToDate,
    response_threshold_reached_at : stringToDate,
    debate_threshold_reached_at : stringToDate,
    scheduled_debate_date : stringToDate
};

/**
 * A petition enriched with additional properties and methods.
 * @constructor
 * @param {Petitions.Petition} rawPetition - The petiton from the data source.
 * @property {string} action - The call to action.
 * @property {string} background - The background to the petition.
 * @property {string} additional_details - The additional details about petition.
 * @property {number} signature_count - The number of signatures.
 * @property {string} state - The state of the petition.
 * @property {Date} created_at - The timestamp petition was created.
 * @property {Date} government_response_at - The timestamp the government responded.
 * @property {Date} response_threshold_reached_at - The timestamp 10000 signatures was reached.
 * @property {Date} debate_threshold_reached_at - The timestamp 100000 signatures was reached.
 * @property {Date} scheduled_debate_date - The date the debate has been scheduled for.
 */
function EnrichedPetition(rawPetition) {
    this.id = rawPetition.id;
    var transform = null;
    for (var key in rawPetition.attributes) {
        transform = keysToTransform[key];
        if (transform) {
            this[key] = transform(rawPetition.attributes[key]);
            transform = null;
        }
        else {
            this[key] = rawPetition.attributes[key];
        }
    }
    Object.freeze(this);
}

module.exports = EnrichedPetition;
