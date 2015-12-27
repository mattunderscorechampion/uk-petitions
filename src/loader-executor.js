

'use strict';

var EventEmitter = require('events');

/**
 * Executor for loader tasks. Listens to the 'error' and 'loaded' events of an
 * emitter returned by the task to poll after task has finished.
 */
function LoaderExecutor(interval) {
    var tasks = [],
        stopped = false,
        current = null;

    var clearAndPoll = function() {
        current = null;
        poll();
    };

    var poll = function() {
        if (current || stopped) {
            return;
        }

        current = tasks.pop();
        if (current) {
            setTimeout(function() {
                if (stopped) {
                    return;
                }

                var emitter = current();
                if (emitter) {
                    emitter.on('error', clearAndPoll);
                    emitter.on('loaded', clearAndPoll);
                }
                else {
                    clearAndPoll();
                }
            }, interval);
        }
    };

    this.execute = function(task) {
        tasks.push(task);
        poll();
    };

    this.stop = function() {
        stopped = true;
    };
}

module.exports = LoaderExecutor;
