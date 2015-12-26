
'use strict';

var https = require("https"),
    PetitionPager = require('./petition-pager'),
    output = require('./simple-output');

var p = new PetitionPager();
p.on('error', output.error)
    .on('petition', output.withSignatureCountDiff)
    .populateRecent();
