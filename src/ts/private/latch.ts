
/**
 * Latch to invoke callbacks when a counter reaches 0.
 */
export class Latch {
    private counter: number;
    private callbacks: {(): void;} [];

    /**
     * The constructor for latches.
     * @param num The intial value of the counter.
     */
    constructor(num: number) {
        this.counter = num;
        this.callbacks = [];
    }

    /**
     * Release a counter.
     */
    release(): void {
        if (this.counter > 0) {
            this.counter = this.counter - 1;

            // If counter hit zero
            if (this.counter === 0) {
                this.callbacks.forEach(function(callback) {
                    callback();
                });
            }
        }
    }

    /**
     * Add a callback.
     */
    onRelease(callback: () => void): void {
        if (this.counter === 0) {
            callback();
        } else {
            this.callbacks.push(callback);
        }
    }
}
