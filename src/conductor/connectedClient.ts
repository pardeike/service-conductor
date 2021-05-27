import { createWriteStream, WriteStream } from 'fs'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { Scenario } from './types'

export class ConnectedClient {
	name: string
	outStream: WriteStream
	errStream: WriteStream
	process: ChildProcessWithoutNullStreams | undefined

	constructor(scenario: Scenario, name: string) {
		this.name = name
		const info = scenario.processes[name]
		this.outStream = createWriteStream(info.stdout)
		this.errStream = createWriteStream(info.stderr)
	}

	static spawn(scenario: Scenario, name: string): ConnectedClient {
		const client = new ConnectedClient(scenario, name)
		const info = scenario.processes[name]
		console.log(`Launching ${name}: ${info.command} ${info.arguments.join(' ')}`)
		const child = spawn(info.command, [...info.arguments, '--conductor', name, '127.0.0.1'], {
			cwd: scenario.root
		})
		child.stdout.pipe(client.outStream)
		child.stderr.pipe(client.errStream)
		child.on('close', code => {
			console.log(`${name} exited with code ${code}`)
		})
		child.on('error', err => {
			console.log(`${name} returned error ${err}`)
		})
		client.process = child
		return client
	}

	exitCode(): number | null {
		return this.process.exitCode
	}

	kill(): void {
		this.outStream.close()
		this.errStream.close()
		console.log(`Killing ${this.name}`)
		process.kill(9)
		process = undefined
	}
}
