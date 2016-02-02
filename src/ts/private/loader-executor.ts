
/**
 * Executor for loader tasks. Listens to the 'error' and 'loaded' events of an
 * emitter returned by the task to poll after task has finished.
 */
export class LoaderExecutor {
    tasks: {(): any;} [];
    stopped: boolean;
    current: {(): any;};
    interval: number;

    constructor(initialInterval: number) {
        this.interval = initialInterval;
        this.tasks = [];
        this.stopped = false;
        this.current = null;
    }

    /**
     * Clear current task and poll.
     */
    clearAndPoll(): void {
        this.current = null;
        this.poll();
    };

    /**
     * Poll for the next task if there is no current work.
     */
    poll(): void {
        if (this.current || this.stopped) {
            return;
        }

        this.current = this.tasks.pop();
        if (this.current) {
            setTimeout(() => {
                if (this.stopped) {
                    return;
                }

                var emitter: any = this.current();
                if (emitter) {
                    emitter.on('error', this.clearAndPoll);
                    emitter.on('loaded', this.clearAndPoll);
                }
                else {
                    this.clearAndPoll();
                }
            }, this.interval);
        }
    };

    /**
     * Execute a task.
     */
    execute(task: {(): any}): void {
        this.tasks.push(task);
        this.poll();
    };

    /**
     * Stop the execution of tasks.
     */
    stop(): void {
        this.stopped = true;
    };

    /**
     * Change the interval between the execution of tasks.
     */
    setInterval(newInterval: number): void {
        this.interval = newInterval;
    };
}
