import ts from 'typescript'
import { transformer } from './conductor'

console.log('Service Conductor initializing...')

export function run(id: string): void {
	console.log(`=== ${id} =========`)
}

export function conductorTransformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
	return transformer(context)
}