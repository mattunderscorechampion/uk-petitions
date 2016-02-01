
'use strict';

describe("EnrichedPetition", function() {
    var EnrichedPetition = require('../target/js/public/enriched-petition').EnrichedPetition;

    var petition = new EnrichedPetition({
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : '2015-01-01'
        }
    });
    var detailedPetition = new EnrichedPetition({
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : '2015-01-01',
            signatures_by_country : {
                country : {
                    code : 'UK',
                    signature_count : 100005
                }
            }
        }
    });

    it('has an ID', function() {
        expect(petition.id).toBeDefined();
        expect(petition.id).toBe(2);
    });
    it('has a signature_count', function() {
        expect(petition.signature_count).toBeDefined();
        expect(petition.signature_count).toBe(100005);
    });
    it('has the debate date as a Date object', function() {
        expect(petition.scheduled_debate_date).toBeDefined();
        expect(petition.scheduled_debate_date).toEqual(new Date('2015-01-01'));
    });
    it('derives additional properties', function() {
        expect(petition.html_url).toBeDefined();
        expect(petition.json_url).toBeDefined();
        expect(petition.html_detail_url).toBeDefined();
        expect(petition.html_response_url).toBeDefined();
        expect(petition.html_debate_url).toBeDefined();
        expect(petition.html_url).toBe('https://petition.parliament.uk/petitions/2');
        expect(petition.json_url).toBe('https://petition.parliament.uk/petitions/2.json');
        expect(petition.html_detail_url).toBe('https://petition.parliament.uk/petitions/2#details-content-0');
        expect(petition.html_response_url).toBe('https://petition.parliament.uk/petitions/2?reveal_response=yes#response-threshold');
        expect(petition.html_debate_url).toBe('https://petition.parliament.uk/petitions/2?#debate-threshold');
        expect(petition.detailed).toBe(false);
        expect(detailedPetition.detailed).toBe(true);
    });
});
