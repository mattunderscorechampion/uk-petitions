
/// <reference path="../node.d.ts" />

import events = require('events');

export module UkPetitions {

/**
 * The emitter returned by methods that load data from an external source.
 */
export class Loading extends events.EventEmitter {

    /**
     * Emit loaded event.
     * @return Self
     */
    loaded(data: any): Loading {
        this.emit('loaded', data);
        return this;
    }

    /**
     * Emit error event.
     * @return Self
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
     * @return Self
     */
    onLoaded(handler: any): Loading {
        this.on('loaded', handler);
        return this;
    };
    /**
     * Add error event listener.
     * @return Self
     */
    onError(handler: any): Loading {
        this.on('error', handler);
        return this;
    };
}

}
