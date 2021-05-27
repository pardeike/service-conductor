import net from 'net'
import split2 from 'split2'

export function startServer(
	markCallback: (processName: string, method: string) => void,
	readyCallback: () => void
): void {
	const server = net.createServer()
	server.maxConnections = 32
	server.listen(1337)

	server.on('listening', () => {
		console.log('Conductor server is listening')
		readyCallback()
	})

	server.on('close', () => {
		console.log('Conductor server closed')
	})

	server.on('error', err => {
		console.log(`Conductor server: ${err}`)
	})

	server.on('connection', socket => {
		let clientName = ''
		socket.setTimeout(800000)
		const lines = socket.pipe(split2())

		lines.on('data', line => {
			const parts = line.split(' ', 2)
			switch (parts[0]) {
				case 'HELLO':
					clientName = parts[1]
					// console.log(`#${clientName} connected`)
					break
				case 'METHOD':
					const method = parts[1]
					// console.log(`#${clientName} => ${method}`)
					markCallback(clientName, method)
					socket.write('CONTINUE\n')
					break
			}
		})

		socket.on('close', err => {
			if (err) console.log(`#${clientName} connection was closed with ${err}`)
		})

		socket.on('end', () => {
			// console.log(`#${clientName} ended connection`)
		})

		socket.on('timeout', () => {
			console.log(`#${clientName} connection timed out`)
			socket.destroy()
		})

		socket.on('error', err => {
			console.log(`#${clientName} connection error: ${err}`)
		})

		lines.on('error', () => {
			// console.log(`#${clientName} connection error: ${err}`)
		})
	})
}
