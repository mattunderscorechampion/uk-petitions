
interface Buffer {
    [index: number]: number;
    write(string: string, offset?: number, length?: number, encoding?: string): number;
    toString(encoding?: string, start?: number, end?: number): string;
    toJSON(): any;
    length: number;
    equals(otherBuffer: Buffer): boolean;
    compare(otherBuffer: Buffer): number;
    copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
    slice(start?: number, end?: number): Buffer;
    fill(value: any, offset?: number, end?: number): Buffer;
    indexOf(value: string | number | Buffer, byteOffset?: number): number;
}

declare var Buffer: {
    new (str: string, encoding?: string): Buffer;
    new (size: number): Buffer;
    new (array: Uint8Array): Buffer;
    new (array: any[]): Buffer;
    new (buffer: Buffer): Buffer;
    prototype: Buffer;
    isBuffer(obj: any): obj is Buffer;
    concat(list: Buffer[], totalLength?: number): Buffer;
};

declare module "util" {
    export function format(format: string, ...param: any[]): string;
}

declare module "https" {
    import eventEmitter = require('events');
    export interface AgentOptions {
        keepAlive?: boolean;
        maxSockets?: number;
    }
    export class Agent {
        constructor(options: AgentOptions);
    }
    export interface RequestOptions {
        hostname: string;
        path: string;
        port?: number;
        agent?: Agent;
    }
    export function get(options: RequestOptions, callback: {(response: any): void;}): eventEmitter.EventEmitter;
}

declare module "events" {
    export class EventEmitter {
        emit(eventName: string, ...eventObjects: any[]): EventEmitter;
        on(eventName: string, listener: {(eventObject: any): void;}): EventEmitter;
    }
}

declare module "deep-equal" {
    function equal(...param: any[]): boolean;
    export = equal;
}
