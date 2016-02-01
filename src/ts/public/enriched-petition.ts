
'use strict';

import util = require('util');

function stringToDate(dateString: string): Date {
    if (dateString) {
        var date:Date = new Date(dateString);
        if (isNaN(date.getTime())) {
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
  * Breakdown of signatures by country.
  */
 export interface SignaturesByCountry {
     /**
      * Name of the country.
      */
     name: string;
     /**
      * The number of signatures from that country.
      */
     signature_count: number;
 }

/**
 * Breakdown of signatures by constituency.
 */
export interface SignaturesByConstituency {
    /**
     * Name of the constituency.
     */
    name: string;
    /**
     * The ONS code.
     */
    ons_code: string;
    /**
     * The name of the MP for the constituency.
     */
    mp: string;
    /**
     * The number of signatures from that constituency.
     */
    signature_count: number;
}

/**
 * A petition enriched with additional properties and methods.
 */
export class EnrichedPetition {
    /**
     * Unique ID of the petiton.
     */
    id: number;
    /**
     * The call to action.
     */
    action: string;
    /**
     * The background to the petition.
     */
    background: string;
    /**
     * The additional details about petition.
     */
    additional_details: string;
    /**
     * The number of signatures.
     */
    signature_count: number;
    /**
     * The state of the petition.
     */
    state: string;
    /**
     * URL for HTML version of the petition.
     */
    html_url: string;
    /**
     * URL for JSON version of the petition.
     */
    json_url: string;
    /**
     * URL for HTML version of the petition showing the additional_details.
     */
    html_detail_url: string;
    /**
     * URL for HTML version of the petition showing the response.
     */
    html_response_url: string;
    /**
     * URL for HTML version of the petition showing the debate.
     */
    html_debate_url: string;
    /**
     * If the petition has detailed information.
     */
    detailed: boolean;
    /**
     * Breakdown of signatures by country.
     */
    signatures_by_country: SignaturesByCountry[];
    /**
     * Breakdown of signatures by constituency.
     */
    signatures_by_constituency: SignaturesByConstituency[];
    /**
     * The timestamp petition was created.
     */
    created_at: Date;
    /**
     * The timestamp the government responded.
     */
    government_response_at: Date;
    /**
     * The timestamp 10000 signatures was reached.
     */
    response_threshold_reached_at: Date;
    /**
     * The timestamp 100000 signatures was reached.
     */
    debate_threshold_reached_at: Date;
    /**
     * The date the debate has been scheduled for.
     */
    scheduled_debate_date: Date;

    /**
     * The constructor for enriched petitions.
     * @param rawPetition The petiton from the data source.
     */
    constructor(rawPetition: any) {
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
        this.detailed = this.signatures_by_country !== undefined;
    }
}
