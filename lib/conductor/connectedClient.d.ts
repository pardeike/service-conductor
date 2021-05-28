/// <reference types="node" />
import { WriteStream } from 'fs';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { Scenario } from './types';
export declare class ConnectedClient {
    name: string;
    seenMethods: Set<string>;
    nextMethod: string;
    nextMethodCallback: () => void;
    outStream: WriteStream;
    errStream: WriteStream;
    client: ChildProcessWithoutNullStreams | undefined;
    constructor(scenario: Scenario, name: string);
    static spawn(scenario: Scenario, name: string): ConnectedClient;
    mark(method: string): void;
    wait(method: string, callback: () => void): void;
    exitCode(): number | null;
    kill(): void;
}
