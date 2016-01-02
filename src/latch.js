
'use strict';

/**
 * Latch to invoke callbacks when a counter reaches 0.
 */
function Latch(num) {
    var counter = num,
        callbacks = [];

    /**
     * Release a counter.
     */
    this.release = function () {
        if (counter > 0) {
            counter = counter - 1;

            // If counter hit zero
            if (counter === 0) {
                callbacks.forEach(function (callback) {
                    callback();
                });
            }
        }
    };

    /**
     * Add a callback.
     */
    this.onRelease = function (callback) {
        if (counter === 0) {
            callback();
        } else {
            callbacks.push(callback);
        }
    };
}

module.exports = Latch;
