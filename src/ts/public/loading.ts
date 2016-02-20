
/// <reference path="../node.d.ts" />

import events = require('events');

export module UkPetitions {

/**
 * Private constructor for Loading.
 * @constructor
 * @classdesc The emitter returned by methods that load data from an external source.
 * @fires Loading#error
 * @fires Loading#loaded
 * @augments EventEmitter
 */
export class Loading extends events.EventEmitter {

    /**
     * Emit loaded event.
     * @return {Loading} - Self
     */
    loaded(data: any): Loading {
        this.emit('loaded', data);
        return this;
    }

    /**
     * Emit error event.
     * @return {Loading} - Self
     */
    error(error: any): Loading {
        if (typeof error === 'string') {
            this.emit('error', new Error(error));
            return this;
        }
        else if (typeof error === 'object') {
            if (error instanceof String) {
                this.emit('error', new Error(error));
                return this;
            }
            else if (error instanceof Error) {
                this.emit('error', error);
                return this;
            }
        }
        this.emit('error', '' + error);
        return this;
    }

    /**
     * Add loaded event listener.
     * @return {Loading} - Self
     */
    onLoaded(handler: any): Loading {
        this.on('loaded', handler);
        return this;
    };
    /**
     * Add error event listener.
     * @return {Loading} - Self
     */
    onError(handler: any): Loading {
        this.on('error', handler);
        return this;
    };
}

}
