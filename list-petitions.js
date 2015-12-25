
const https = require("https");
const util = require('util');
const EventEmitter = require('events');

function PetitionLoader() {
  this.load = function(petitionId) {
    var emitter = new EventEmitter();
    https.get({
      hostname: 'petition.parliament.uk',
      port: 443,
      path: '/petitions/' + petitionId + '.json'
    }, function (res) {
      var buffers = [];
      res.on('data', function(d) {
        buffers.push(d);
      }).on('end', function() {
        var completeBuffer = Buffer.concat(buffers);
        var jsonResponse = JSON.parse(completeBuffer);
        emitter.emit('loaded', jsonResponse.data);
      });
    }).on('error', function(e) {
      console.log("Error: " + e.message);
    });
    return emitter;
  };
}

function InternalPetitions() {
  EventEmitter.call(this);
  var self = this;
  var setPartitionData = function(data) {
    var update = self.petitions[data.id];
    self.petitions[data.id] = data;
    if (update) {
      self.emit('petition', data);
    }
    else {
      self.petitions.length++;
      self.emit('petition', data);
    }
  };
  var loadPage = function(path) {
    var emitter = new EventEmitter();
    https.get({
      hostname: 'petition.parliament.uk',
      port: 443,
      path: path
    }, function (res) {
      var buffers = [];
      res.on('data', function(d) {
        buffers.push(d);
      }).on('end', function() {
        var completeBuffer = Buffer.concat(buffers);
        var jsonResponse = JSON.parse(completeBuffer);
        jsonResponse.data.forEach(setPartitionData);
        emitter.emit('page-loaded', {next : jsonResponse.links.next});
      });
    }).on('error', function(e) {
      console.log("Error: " + e.message);
    });
    return emitter;
  }

  this.populateAll = function () {
    var emitter = new EventEmitter();

    // Load the next page
    var loadNextPage = function(data) {
      if (data.next != null) {
        var index = data.next.lastIndexOf('/');
        var nextPath = data.next.substring(index);
        loadPage(nextPath).on('page-loaded', loadNextPage);
      }
      else {
        emitter.emit('all-loaded', self);
      }
    };

    // Load first page
    loadPage('/petitions.json').on('page-loaded', loadNextPage);

    return emitter;
  };
  this.petitions = {
    length: 0
  };
}
util.inherits(InternalPetitions, EventEmitter);

var logByCountry = function(data) {
  console.log(data.attributes.action);
  var total_signatures = data.attributes.signature_count;
  data.attributes.signatures_by_country.forEach(function(pair) {
    var percentage = (pair.signature_count / total_signatures) * 100;
    console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
  });
}

var loader = new PetitionLoader();
loader.load(113064).on('loaded', logByCountry);

/*var p = new InternalPetitions();
p.on('petition', function(data) {
  console.log(data.attributes.action);
}).populateAll().on('all-loaded', function() {
  console.log(p.petitions.length);
});*/
