
'use strict';

var queries = require('../target/js/public/petition-queries').UkPetitions;

module.exports = {
    PetitionsMonitor : require('../target/js/public/petitions-monitor').UkPetitions.PetitionsMonitor,
    PetitionLoader : require('../target/js/public/petition-loader').UkPetitions.PetitionLoader,
    PetitionPageLoader : require('../target/js/public/petition-page-loader').UkPetitions.PetitionPageLoader,
    PetitionPager : require('../target/js/public/petition-pager').UkPetitions.PetitionPager,
    checks : queries.checks,
    predicates : queries.predicates,
    output : require('../target/js/public/simple-output').UkPetitions
};
