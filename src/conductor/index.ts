import fs from 'fs'
import yargs from 'yargs'
import yaml from 'yaml'
import { Scenario, ScenarioFile } from './types'
import { sendMethodToConductor } from './client'
import { startServer } from './server'
import { ConnectedClient } from './connectedClient'

const options = yargs.options({
	scenario: {
		alias: 'f',
		type: 'string',
		description: 'scenario file'
	}
}).argv

let scenario: Scenario
const childProcesses: { [processName: string]: ConnectedClient } = {}

function methodCallback(id: string): void {
	sendMethodToConductor(id)
}

function start(name: string): void {
	childProcesses[name] = ConnectedClient.spawn(scenario, name)
}

function stop(name: string): void {
	if (childProcesses[name].exitCode() == null) {
		childProcesses[name].kill()
	}
}

function perform(path: string): void {
	const content = fs.readFileSync(path, 'utf8')
	const scenarioFile = yaml.parse(content) as ScenarioFile
	scenario = scenarioFile.scenario
	startServer()
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
		if (options.scenario) perform(options.scenario)
	}
}
