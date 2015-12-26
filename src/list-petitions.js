
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

var p = new PetitionPager();
p.on('error', logError)
    .on('petition', logWithSignatureCountDiff)
    .on('recent-loaded', function () {
        // Check the first page for any changes
        p.populateRecent();
    })
    .populateRecent();
