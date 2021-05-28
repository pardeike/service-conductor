"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectedClient = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
class ConnectedClient {
    constructor(scenario, name) {
        this.name = name;
        this.seenMethods = new Set();
        this.nextMethod = '';
        const info = scenario.processes[name];
        this.outStream = fs_1.createWriteStream(info.stdout);
        this.errStream = fs_1.createWriteStream(info.stderr);
    }
    static spawn(scenario, name) {
        const instance = new ConnectedClient(scenario, name);
        const info = scenario.processes[name];
        console.log(`Launching ${name}: ${info.command} ${info.arguments.join(' ')}`);
        const client = child_process_1.spawn(info.command, [...info.arguments, '--conductor', name, '127.0.0.1'], {
            cwd: scenario.root
        });
        client.stdout.pipe(instance.outStream);
        client.stderr.pipe(instance.errStream);
        client.on('close', code => {
            console.log(`${name} exited with code ${code}`);
        });
        client.on('error', err => {
            console.log(`${name} returned error ${err}`);
        });
        instance.client = client;
        return instance;
    }
    mark(method) {
        console.log(`---> ${this.name}: ${method}`);
        if (method == this.nextMethod) {
            this.seenMethods.delete(method);
            this.nextMethod = '';
            this.nextMethodCallback();
            this.nextMethodCallback = undefined;
            return;
        }
        this.seenMethods.add(method);
    }
    wait(method, callback) {
        console.log(`...${this.name}: ${method}`);
        if (this.seenMethods.has(method)) {
            this.seenMethods.delete(method);
            this.nextMethod = '';
            this.nextMethodCallback = undefined;
            callback();
            return;
        }
        this.nextMethod = method;
        this.nextMethodCallback = callback;
    }
    exitCode() {
        return this.client.exitCode;
    }
    kill() {
        this.outStream.close();
        this.errStream.close();
        console.log(`Killing ${this.name}`);
        this.client.kill(9);
        this.client = undefined;
    }
}
exports.ConnectedClient = ConnectedClient;
//# sourceMappingURL=connectedClient.js.map