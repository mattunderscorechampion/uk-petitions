
'use strict';

module.exports = {
    /**
     * Print out an error.
     */
    error : function (error) {
        console.error('Error: ' + error.message);
    },

    /**
     * Print out the action of a petition.
     */
    action : function (data) {
        console.log(data.attributes.action);
    },

    /**
     * Print out all the action and break down of signatures by country.
     */
    byCountry : function (data) {
        console.log(data.attributes.action);
        var total_signatures = data.attributes.signature_count;
        data.attributes.signatures_by_country.forEach(function (pair) {
            var percentage = (pair.signature_count / total_signatures) * 100;
            console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
        });
    },

    /**
     * Print out all the action and break down of signatures of the top 5 countries.
     */
    withTop5Countries : function (data) {
        console.log('Action: %s', data.attributes.action);
        console.log('Top 5 countries:');
        var total_signatures = data.attributes.signature_count;
        data.attributes.signatures_by_country
            .slice()
            .sort(function(country0, country1) {
                return country1.signature_count - country0.signature_count;
            })
            .slice(0, Math.min(5, data.attributes.signatures_by_country.length))
            .forEach(function (pair) {
                var percentage = (pair.signature_count / total_signatures) * 100;
                console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
            });
    },

    /**
     * Print out all the action and total signature count.
     */
    withSignatureCount : function (data) {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d', data.attributes.signature_count);
    },

    /**
     * Print out all the action, total signature count and previous signature count.
     */
    withSignatureCountDiff : function (data, oldData) {
        if (oldData) {
            console.log('Action: %s', data.attributes.action);
            console.log('Signatures: %d (was %d)', data.attributes.signature_count, oldData.attributes.signature_count);
        }
        else {
            console.log('Action: %s', data.attributes.action);
            console.log('Signatures: %d', data.attributes.signature_count);
        }
    },

    /**
     * Print out all the attributes of a petition.
     */
    attributes : function (data) {
        console.log(data.attributes);
    }
};
