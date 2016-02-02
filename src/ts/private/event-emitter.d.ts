
declare module "event-emitter" {
    export interface EventEmitter {
        emit(eventName: string, eventObject: any): EventEmitter;
        on(eventName: string, listener: {(eventObject: any): void;}): EventEmitter;
    }
}
