
'use strict';

var PetitionPager = require('../petition-pager'),
    output = require('../simple-output');

new PetitionPager()
    .on('error', output.error)
    .on('petition', output.withSignatureCountDiff)
    .populateAll();
