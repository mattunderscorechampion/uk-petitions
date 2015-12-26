
'use strict';

var https = require("https"),
    EventEmitter = require('events'),
    PetitionPager = require('./petition-pager');

var logByCountry = function (data) {
    console.log(data.attributes.action);
    var total_signatures = data.attributes.signature_count;
    data.attributes.signatures_by_country.forEach(function (pair) {
        var percentage = (pair.signature_count / total_signatures) * 100;
        console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
    });
};

var logWithTop5Countries = function (data) {
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
};

var logWithSignatureCount = function (data) {
    console.log('Action: %s', data.attributes.action);
    console.log('Signatures: %d', data.attributes.signature_count);
};

var logWithSignatureCountDiff = function (data, oldData) {
    if (oldData) {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d (was %d)', data.attributes.signature_count, oldData.attributes.signature_count);
    }
    else {
        console.log('Action: %s', data.attributes.action);
        console.log('Signatures: %d', data.attributes.signature_count);
    }
};

/**
 * Print out all the attributes of a petition.
 */
var logAttributes = function (data) {
    console.log(data.attributes);
};

/**
 * Print out the action of a petition.
 */
var logAction = function (data) {
    console.log(data.attributes.action);
};

/**
 * Print out an error.
 */
var logError = function (error) {
    console.error('Error: ' + error.message);
};

var petitions = {
    preconditions : {
        samePetitionId : function(petition0, petition1) {
            if (!petitions.checks.samePetitionId(petition0, petition1)) {
                throw new Error('Petition IDs should be the same but are different');
            }
        }
    },
    predicates : {
        reached10_000 : function(data) {
            return data.attributes.signature_count >= 10000;
        },
        reached100_000 : function(data) {
            return data.attributes.signature_count >= 100000;
        },
        governmentResponded : function(data) {
            return data.attributes.government_response !== null;
        },
        debated : function(data) {
            return data.attributes.debate !== null;
        }
    },
    checks : {
        samePetitionId : function(petition0, petition1) {
            return petition0.id === petition1.id;
        },
        delta : {
            reached10_000 : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                var predicate = petitions.predicates.reached10_000;
                return predicate(newData) && !predicate(oldData);
            },
            reached100_000 : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                var predicate = petitions.predicates.reached100_000;
                return predicate(newData) && !predicate(oldData);
            },
            governmentResponded : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                var predicate = petitions.predicates.governmentResponded;
                return predicate(newData) && !predicate(oldData);
            },
            debated : function(newData, oldData) {
                petitions.preconditions.samePetitionId(oldData, newData);
                var predicate = petitions.predicates.debated;
                return predicate(newData) && !predicate(oldData);
            }
        }
    }
};

var p = new PetitionPager();
p.on('error', logError)
    .on('petition', logWithSignatureCountDiff)
    .on('recent-loaded', function () {
        // Check the first page for any changes
        p.populateRecent();
    })
    .populateRecent();
