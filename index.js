console.log('Service Conductor initializing...')

module.exports = {
	run: (id) => {
		console.log(`=== ${id} =========`)
	},
	transformer: require('./transformers/conductor').conductorTransformer
}