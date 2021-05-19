import { transformer } from './conductor'

console.log('Service Conductor initializing...')

function run(id: string): void {
	console.log(`=== ${id} =========`)
}

export default {
	run: run,
	transformer: transformer
}