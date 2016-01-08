
describe("EnrichedPetition", function() {
    var EnrichedPetition = require('../src/enriched-petition');

    var petition = new EnrichedPetition({
        id: 2,
        attributes : {
            signature_count : 100005,
            scheduled_debate_date : '2015-01-01'
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
});
