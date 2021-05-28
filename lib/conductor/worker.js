"use strict";
const { Socket } = require('net');
const { parentPort } = require('worker_threads');
let semaphore = undefined;
let socket = undefined;
console.log('WORKER INIT');
parentPort.on('message', data => {
    console.log('WORKER: ' + JSON.stringify(data));
    if (socket == undefined && data.semaphore) {
        semaphore = data.semaphore;
        const host = data.conductorHost;
        const clientName = data.clientName;
        console.log('Connecting to conductor@' + host + ' as ' + clientName);
        socket = new Socket();
        socket.connect(1337, host);
        socket.on('connect', () => {
            console.log('Connected to conductor');
            socket.write('HELLO ' + clientName);
        });
        socket.on('data', data => {
            console.log('Received: ' + data);
            if (data.toString() == 'CONTINUE')
                Atomics.notify(semaphore, 0, 1);
        });
        socket.on('close', function () {
            console.log('Connection closed');
            socket = undefined;
        });
        socket.on('error', error => {
            console.log('error: ' + error);
        });
    }
    if (data.method)
        socket.write('METHOD ' + data.method);
});
//# sourceMappingURL=worker.js.map