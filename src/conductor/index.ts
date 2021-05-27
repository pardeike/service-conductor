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
let idx = 0
const childProcesses: { [processName: string]: ConnectedClient } = {}

function methodCallback(id: string): void {
	sendMethodToConductor(id)
}

function mark(processName: string, method: string): void {
	childProcesses[processName].mark(method)
}

function nextStep(): void {
	const step = scenario.execution.shift()
	if (step == undefined) {
		console.log('')
		console.log(`DONE`)
		return
	}

	console.log('')
	console.log(`STEP ${++idx}`)

	const [processName, str] = Object.entries(step)[0]
	const command = str.trim()

	if (command == 'start') {
		childProcesses[processName] = ConnectedClient.spawn(scenario, processName)
		setImmediate(nextStep)
		return
	}

	if (command == 'stop') {
		childProcesses[processName].kill()
		setImmediate(nextStep)
		return
	}

	if (command.startsWith('exec ')) {
		childProcesses[processName].wait(command.substr(5), () => setImmediate(nextStep))
		return
	}
}

function perform(path: string): void {
	const content = fs.readFileSync(path, 'utf8')
	const scenarioFile = yaml.parse(content) as ScenarioFile
	scenario = scenarioFile.scenario
	idx = 0
	startServer(mark, () => {
		console.log(`Starting scenario ${scenario.name} in ${scenario.root}`)
		setImmediate(nextStep)
	})
}

export default {
	methodCallback,
	main: (): void => {
		if (options.scenario) perform(options.scenario)
	}
}
