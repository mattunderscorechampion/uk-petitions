
'use strict';

var https = require("https"),
    EventEmitter = require('events'),
    PetitionPager = require('./petition-pager'),
    output = require('./simple-output');

var p = new PetitionPager();
p.on('error', output.error)
    .on('petition', output.withSignatureCountDiff)
    .on('recent-loaded', function () {
        // Check the first page for any changes
        p.populateRecent();
    })
    .populateRecent();
