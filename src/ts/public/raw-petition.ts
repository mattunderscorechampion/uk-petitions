
export module UkPetitions {
    export interface Response {
        /**
         * Summary of the response.
         */
        summary: string;
        /**
         * Detailed response.
         */
        details: string;
        /**
         * The timestamp the government responded.
         */
        created_at: string;
        /**
         * The timestamp the government last updated the response.
         */
        updated_at: string;
    }

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
    * Information about the petition.
    */
    export interface Attributes {
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
         * The timestamp petition was created.
         */
        created_at: string;
        /**
         * The timestamp the government responded.
         */
        government_response_at: string;
        /**
         * The timestamp 10000 signatures was reached.
         */
        response_threshold_reached_at: string;
        /**
         * The timestamp 100000 signatures was reached.
         */
        debate_threshold_reached_at: string;
        /**
         * The date the debate has been scheduled for.
         */
        scheduled_debate_date: string;
        /**
         * The signatures by country.
         */
        signatures_by_country?: SignaturesByCountry;
        /**
         * The signatures by constituency.
         */
        signatures_by_constituency?: SignaturesByConstituency;
    }

    /**
     * Representation of a petition.
     */
    export interface Petition {
        /**
         * The id of the petition
         */
        id: number;
        /**
         * The information known about the petition.
         */
        attributes: Attributes;
    }
}
