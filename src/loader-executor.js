
'use strict';

var EventEmitter = require('events');

/**
 * Executor for loader tasks. Listens to the 'error' and 'loaded' events of an
 * emitter returned by the task to poll after task has finished.
 */
function LoaderExecutor(initialInterval) {
    var tasks = [],
        stopped = false,
        current = null,
        interval = initialInterval;

    /**
     * Clear current task and poll.
     */
    var clearAndPoll = function() {
        current = null;
        poll();
    };

    /**
     * Poll for the next task if there is no current work.
     */
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

    /**
     * Execute a task.
     */
    this.execute = function(task) {
        tasks.push(task);
        poll();
    };

    /**
     * Stop the execution of tasks.
     */
    this.stop = function() {
        stopped = true;
    };

    /**
     * Change the interval between the execution of tasks.
     */
    this.setInterval = function(newInterval) {
        interval = newInterval;
    };
}

module.exports = LoaderExecutor;
