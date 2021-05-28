"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMethodToConductor = void 0;
const worker_threads_1 = require("worker_threads");
const [paramName, clientName, conductorHost] = process.argv.slice(-3);
const conductorMode = paramName == '--conductor' && clientName && conductorHost;
const workerScript = `
const { Socket } = require('net')
const split2 = require('split2')
const { parentPort, workerData } = require('worker_threads')

console.log('WORKER INIT: ' + JSON.stringify(workerData))

const semaphore = workerData.semaphore
let socket = new Socket()
console.log('Connecting to conductor@' + workerData.conductorHost + ' as ' + workerData.clientName)
socket.connect(1337, workerData.conductorHost)

socket.on('connect', () => {
	console.log('Connected to conductor')
	socket.write('HELLO ' + workerData.clientName + String.fromCharCode(10))
})

socket.pipe(split2()).on('data', line => {
	console.log('Received: ' + line)
	if (line == 'CONTINUE') Atomics.notify(semaphore, 0, 1)
})

socket.on('close', () => {
	console.log('Connection closed')
	socket = undefined
})

socket.on('error', error => {
	console.log('error: ' + error)
})

parentPort.on('message', data => {
	const msg = 'METHOD ' + data.method
	if (socket) {
		console.log('Sending: ' + msg)
		socket.write(msg + String.fromCharCode(10))
	} else {
		console.log('Cannot send ' + msg + ': not connected')
	}
})

function looper() {
	console.log('worker loop')
	setTimeout(looper, 1000)
}
looper()
`;
const semaphore = new Int32Array(new SharedArrayBuffer(4));
let worker = undefined;
if (conductorMode) {
    const options = {
        workerData: { semaphore, clientName, conductorHost },
        eval: true,
        stdout: true,
        stderr: true
    };
    worker = new worker_threads_1.Worker(workerScript, options);
    console.log(`WORKER CREATED: ${JSON.stringify(options)}`);
    worker.on('error', error => {
        console.log(`Worker error ${error}`);
    });
    worker.on('exit', exitCode => {
        console.log(`Worker exited with code ${exitCode}`);
    });
}
function sendMethodToConductor(id) {
    if (!conductorMode)
        return;
    console.log(`ENTER METHOD ${id}`);
    worker.postMessage({ method: id });
    console.log(`MESSAGE POSTED`);
    Atomics.wait(semaphore, 0, 0);
    Atomics.store(semaphore, 0, 0);
    console.log(`EXIT METHOD ${id}`);
}
exports.sendMethodToConductor = sendMethodToConductor;
//# sourceMappingURL=client.js.map