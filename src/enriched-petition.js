
'use strict';

var util = require('util');

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
 * @property {string} html_url - URL for HTML version of the petition.
 * @property {string} json_url - URL for JSON version of the petition.
 * @property {string} html_detail_url - URL for HTML version of the petition showing the additional_details.
 * @property {string} html_response_url - URL for HTML version of the petition showing the response.
 * @property {string} html_debate_url - URL for HTML version of the petition showing the debate.
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
    this.html_url = util.format('https://petition.parliament.uk/petitions/%d', this.id);
    this.json_url = util.format('https://petition.parliament.uk/petitions/%d.json', this.id);
    this.html_detail_url = util.format('https://petition.parliament.uk/petitions/%d#details-content-0', this.id);
    this.html_response_url = util.format('https://petition.parliament.uk/petitions/%d?reveal_response=yes#response-threshold', this.id);
    this.html_debate_url = util.format('https://petition.parliament.uk/petitions/%d?#debate-threshold', this.id);
}

module.exports = EnrichedPetition;
