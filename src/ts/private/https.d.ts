
declare module "https" {
    import eventEmitter = require('event-emitter');
    export function get(options: any, callback: {(response: any): void;}): eventEmitter.EventEmitter;
}
