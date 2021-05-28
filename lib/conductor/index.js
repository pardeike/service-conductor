"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const yargs_1 = __importDefault(require("yargs"));
const yaml_1 = __importDefault(require("yaml"));
const client_1 = require("./client");
const server_1 = require("./server");
const connectedClient_1 = require("./connectedClient");
const options = yargs_1.default.options({
    scenario: {
        alias: 'f',
        type: 'string',
        description: 'scenario file'
    }
}).argv;
let scenario;
let idx = 0;
const childProcesses = {};
function methodCallback(id) {
    client_1.sendMethodToConductor(id);
}
function mark(processName, method) {
    childProcesses[processName].mark(method);
}
function nextStep() {
    const step = scenario.execution.shift();
    if (step == undefined) {
        console.log('');
        console.log(`DONE`);
        return;
    }
    console.log('');
    console.log(`STEP ${++idx}`);
    const [processName, str] = Object.entries(step)[0];
    const command = str.trim();
    if (command == 'start') {
        childProcesses[processName] = connectedClient_1.ConnectedClient.spawn(scenario, processName);
        setImmediate(nextStep);
        return;
    }
    if (command == 'stop') {
        childProcesses[processName].kill();
        setImmediate(nextStep);
        return;
    }
    if (command.startsWith('exec ')) {
        childProcesses[processName].wait(command.substr(5), () => setImmediate(nextStep));
        return;
    }
}
function perform(path) {
    const content = fs_1.default.readFileSync(path, 'utf8');
    const scenarioFile = yaml_1.default.parse(content);
    scenario = scenarioFile.scenario;
    idx = 0;
    server_1.startServer(mark, () => {
        console.log(`Starting scenario ${scenario.name} in ${scenario.root}`);
        setImmediate(nextStep);
    });
}
exports.default = {
    methodCallback,
    main: () => {
        if (options.scenario)
            perform(options.scenario);
    }
};
//# sourceMappingURL=index.js.map