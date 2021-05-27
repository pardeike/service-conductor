import { createWriteStream, WriteStream } from 'fs'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { Scenario } from './types'

export class ConnectedClient {
	name: string
	seenMethods: Set<string>
	nextMethod: string
	nextMethodCallback: () => void
	outStream: WriteStream
	errStream: WriteStream
	client: ChildProcessWithoutNullStreams | undefined

	constructor(scenario: Scenario, name: string) {
		this.name = name
		this.seenMethods = new Set<string>()
		this.nextMethod = ''
		const info = scenario.processes[name]
		this.outStream = createWriteStream(info.stdout)
		this.errStream = createWriteStream(info.stderr)
	}

	static spawn(scenario: Scenario, name: string): ConnectedClient {
		const instance = new ConnectedClient(scenario, name)
		const info = scenario.processes[name]
		console.log(`Launching ${name}: ${info.command} ${info.arguments.join(' ')}`)
		const client = spawn(info.command, [...info.arguments, '--conductor', name, '127.0.0.1'], {
			cwd: scenario.root
		})
		client.stdout.pipe(instance.outStream)
		client.stderr.pipe(instance.errStream)
		client.on('close', code => {
			console.log(`${name} exited with code ${code}`)
		})
		client.on('error', err => {
			console.log(`${name} returned error ${err}`)
		})
		instance.client = client
		return instance
	}

	mark(method: string): void {
		console.log(`---> ${this.name}: ${method}`)
		if (method == this.nextMethod) {
			this.seenMethods.delete(method)
			this.nextMethod = ''
			this.nextMethodCallback()
			this.nextMethodCallback = undefined
			return
		}
		this.seenMethods.add(method)
	}

	wait(method: string, callback: () => void): void {
		console.log(`...${this.name}: ${method}`)
		if (this.seenMethods.has(method)) {
			this.seenMethods.delete(method)
			this.nextMethod = ''
			this.nextMethodCallback = undefined
			callback()
			return
		}
		this.nextMethod = method
		this.nextMethodCallback = callback
	}

	exitCode(): number | null {
		return this.client.exitCode
	}

	kill(): void {
		this.outStream.close()
		this.errStream.close()
		console.log(`Killing ${this.name}`)
		this.client.kill(9)
		this.client = undefined
	}
}
