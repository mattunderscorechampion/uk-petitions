
'use strict';

/**
 * Petition information loaded from the data source.
 * @namespace Petitions
 */

/**
 * Government response to the petition.
 * @typedef {object} Petitions.Response
 * @property {string} summary - Summary of the response.
 * @property {string} details - Detailed response.
 * @property {string} created_at - The timestamp the government responded.
 * @property {string} updated_at - The timestamp the government last updated the response.
 */

/**
 * Summary of information about the petition.
 * @typedef {object} Petitions.Summary
 * @property {string} action - The call to action.
 * @property {string} background - The background to the petition.
 * @property {string} additional_details - The additional details about petition.
 * @property {number} signature_count - The number of signatures.
 * @property {string} state - The state of the petition.
 * @property {string} created_at - The timestamp petition was created.
 * @property {string} government_response_at - The timestamp the government responded.
 * @property {string} response_threshold_reached_at - The timestamp 10000 signatures was reached.
 * @property {string} debate_threshold_reached_at - The timestamp 100000 signatures was reached.
 * @property {string} scheduled_debate_date - The date the debate has been scheduled for.
 */

/**
 * Breakdown of signatures by country.
 * @typedef {object} Petitions.SignaturesByCountry
 * @property {string} name - Name of the country.
 * @property {number} signature_count - The number of signatures from that country.
 */

/**
 * Breakdown of signatures by constituency.
 * @typedef {object} Petitions.SignaturesByConstituency
 * @property {string} name - Name of the constituency.
 * @property {string} ons_code - The ONS code.
 * @property {string} mp - The name of the MP for the constituency.
 * @property {number} signature_count - The number of signatures from that constituency.
 */

/**
 * Detailed information about the petition.
 * @typedef {object} Petitions.Detail
 * @property {string} action - The call to action.
 * @property {string} background - The background to the petition.
 * @property {string} additional_details - The additional details about petition.
 * @property {number} signature_count - The number of signatures.
 * @property {string} state - The state of the petition.
 * @property {string} created_at - The timestamp petition was created.
 * @property {string} government_response_at - The timestamp the government responded.
 * @property {string} response_threshold_reached_at - The timestamp 10000 signatures was reached.
 * @property {string} debate_threshold_reached_at - The timestamp 100000 signatures was reached.
 * @property {string} scheduled_debate_date - The date the debate has been scheduled for.
 * @property {Petitions.SignaturesByCountry} signatures_by_country - The signatures by country.
 * @property {Petitions.SignaturesByConstituency} signatures_by_constituency - The signatures by constituency.
 */

/**
 * Representation of a petition.
 * @typedef {object} Petitions.Petition
 * @property {number} id - The id of the petition.
 * @property {Petitions.Summary|Petitions.Detail} attributes - The information known about the petition.
 */

/**
 * The petitions module.
 * @module petitions
 * @author Matt Champion
 */
module.exports = {
    PetitionsMonitor : require('../target/js/public/petitions-monitor').UkPetitions.PetitionsMonitor,
    PetitionLoader : require('../target/js/public/petition-loader').UkPetitions.PetitionLoader,
    PetitionPageLoader : require('../target/js/public/petition-page-loader').UkPetitions.PetitionPageLoader,
    PetitionPager : require('../target/js/public/petition-pager').UkPetitions.PetitionPager,
    queries : require('../target/js/public/petition-queries').UkPetitions,
    output : require('../target/js/public/simple-output').UkPetitions
};
