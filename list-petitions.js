
const https = require("https");
const util = require('util');
const EventEmitter = require('events');

/**
 * Forward an error to another emitter.
 */
var forwardError = function (emitter) {
  return function (error) {
    emitter.emit('error', error);
  }
}

/**
 * Loads the data of a petition. It is stateless.
 */
function PetitionLoader() {
  /**
   * Load the petition by Id. Returns an emitter. Emits either 'loaded' or 'error' events.
   * The 'loaded' event is passed the data of the petition.
   * The 'error' event is passed the Error.
   */
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
    }).on('error', forwardError(emitter));
    return emitter;
  };
}

function PetitionPager() {
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
    }).on('error', forwardError(emitter));
    return emitter;
  }

  this.populateAll = function () {
    // Load the next page
    var loadNextPage = function(data) {
      if (data.next != null) {
        var index = data.next.lastIndexOf('/');
        var nextPath = data.next.substring(index);
        loadPage(nextPath).on('page-loaded', loadNextPage);
      }
      else {
        self.emit('all-loaded', self);
      }
    };

    // Load first page
    loadPage('/petitions.json').on('page-loaded', loadNextPage).on('error', forwardError(self));

    return self;
  };

  this.populateRecent = function () {
    // Load first page
    loadPage('/petitions.json').on('page-loaded', function() {
      self.emit('recent-loaded', self);
    }).on('error', forwardError(self));

    return self;
  };

  this.petitions = {
    length: 0
  };
}
util.inherits(PetitionPager, EventEmitter);

var logByCountry = function(data) {
  console.log(data.attributes.action);
  var total_signatures = data.attributes.signature_count;
  data.attributes.signatures_by_country.forEach(function(pair) {
    var percentage = (pair.signature_count / total_signatures) * 100;
    console.log('%s: %d (%d%%)', pair.name, pair.signature_count, percentage.toFixed(4));
  });
};

/**
 * Print out all the attributes of a petition.
 */
var logAttributes = function(data) {
  console.log(data.attributes);
};

/**
 * Print out the action of a petition.
 */
var logAction = function(data) {
  console.log(data.attributes.action);
};

/**
 * Print out an error.
 */
var logError = function(error) {
  console.error('Error: ' + error.message);
}

var loader = new PetitionLoader();
loader.load(113064).on('error', logError).on('loaded', logAction);

var p = new PetitionPager();
p.on('error', logError).on('petition', logAction).on('recent-loaded', function() {
  console.log(p.petitions.length);
}).populateRecent();
