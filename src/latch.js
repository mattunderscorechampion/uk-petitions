
'use strict';

/**
 * A simple latch that can be released once.  Release may need to be called
 * muliple times before the latch is released.
 */
function Latch(num) {
    var number = num, callbacks = [];

    this.release = function () {
        if (number > 0) {
            number = number - 1;
            if (number === 0) {
                callbacks.forEach(function (callback) {
                    callback();
                });
            }
        }
    };

    this.onRelease = function (callback) {
        if (number === 0) {
            callback();
        } else {
            callbacks.push(callback);
        }
    };
}

module.exports = Latch;
