
declare module "events" {
    import eventEmitter = require('event-emitter');
    function EventEmitterConstructor() : void;

    export = EventEmitterConstructor;
}
