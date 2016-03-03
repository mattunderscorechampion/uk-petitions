
'use strict';

var ukPetitions = require('../');

new ukPetitions.PetitionPager()
    .on('error', ukPetitions.output.error)
    .on('petition', ukPetitions.output.withSignatureCountDiff)
    .populate(
        // Accept all
        function() {
            return true;
        },
        // Remove none
        function() {
            return false;
        });
