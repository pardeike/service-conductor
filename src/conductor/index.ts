import { ChildProcess, exec } from 'child_process'
import fs from 'fs'
import yargs from 'yargs'
import yaml from 'yaml'
import { Scenario, ScenarioFile } from './types'

const options = yargs.options({
    conductor: {
        type: 'string',
        description: 'connect to conductor',
    },
    scenario: {
        alias: 'f',
        type: 'string',
        description: 'scenario file',
    },
}).argv

let scenario: Scenario
const childProcesses: {[processName: string]: ChildProcess} = {}

function methodCallback(id: string): void {
    console.log(`#### ${id}`)
}

function connect(host: string): void {
    console.log(`Connecting to conductor host=${host}`)
}

function start(name: string): void {
    console.log(`Launching ${name}`)
    const info = scenario.processes[name]
    childProcesses[name] = exec(info.command, {cwd: scenario.root}, (error, stdout, stderr) => {
        if (stdout) console.log(stdout)
        if (stderr) console.log(stderr)
        if (error && !error.killed) console.log(error)
    })
}

function stop(name: string): void {
    if (childProcesses[name]?.exitCode == null) {
        console.log(`Killing ${name}`)
        childProcesses[name].kill(9)
    }
}

function perform(path: string): void {
    const content = fs.readFileSync(path, 'utf8')
    const scenarioFile = yaml.parse(content) as ScenarioFile
    scenario = scenarioFile.scenario
    console.log(`Starting scenario ${scenario.name} in ${scenario.root}`)
    scenario.execution.forEach(step => {
        const [processName, str] = Object.entries(step)[0]
        const command = str.trim()
        if (command == 'start') start(processName)
        else if (command == 'stop') stop(processName)
        else if (command.startsWith('exec ')) {
            const method = command.substr(5)
            console.log(`Executing '${method}' in ${processName}`)
        }
    })
}

export default {
    methodCallback,
    main: (): void => {
        if (options.conductor) connect(options.conductor)
        if (options.scenario) perform(options.scenario)
    }
}