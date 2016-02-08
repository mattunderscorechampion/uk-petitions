
'use strict';

var PetitionPager = require('../../target/js/public/petition-pager').PetitionPager,
    output = require('../../target/js/private/simple-output');

new PetitionPager()
    .on('error', output.error)
    .on('petition', output.withSignatureCountDiff)
    .populateHot();
