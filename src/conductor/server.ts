import net from 'net'
import split2 from 'split2'

export function startServer(): void {
	const server = net.createServer()
	server.maxConnections = 32
	server.listen(1337)
	console.log('Conductor server started')

	server.on('listening', () => {
		console.log('Conductor server is listening')
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

		socket.pipe(split2()).on('data', line => {
			const parts = line.split(' ', 2)
			switch (parts[0]) {
				case 'HELLO':
					clientName = parts[1]
					console.log(`#${clientName} connected`)
					break
				case 'METHOD':
					console.log(`#${clientName} => ${parts[1]}`)
					setTimeout(() => {
						console.log(`#${clientName} allowed to continue`)
						socket.write('CONTINUE\n')
					}, 2000)
					break
			}
		})

		socket.on('close', err => {
			if (err) console.log(`#${clientName} connection was closed with ${err}`)
		})

		socket.on('end', () => {
			console.log(`#${clientName} ended connection`)
		})

		socket.on('timeout', () => {
			console.log(`#${clientName} connection timed out`)
			socket.destroy()
		})

		socket.on('error', err => {
			console.log(`#${clientName} connection error: ${err}`)
		})
	})
}
