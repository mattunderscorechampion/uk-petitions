
'use strict';

var ukPetitions = require('../../');

new ukPetitions.PetitionPager()
    .on('error', ukPetitions.output.error)
    .on('petition', ukPetitions.output.withSignatureCountDiff)
    .populateHot();
