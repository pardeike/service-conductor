import ts from 'typescript'

function setMethodBody(factory: ts.NodeFactory, node: ts.MethodDeclaration, body: ts.Block): ts.MethodDeclaration {
	return factory.updateMethodDeclaration(
		node,
		node.decorators,
		node.modifiers,
		node.asteriskToken,
		node.name,
		node.questionToken,
		node.typeParameters,
		node.parameters,
		node.type,
		body,
	)
}

function setFunctionBody(factory: ts.NodeFactory, node: ts.FunctionDeclaration, body: ts.Block): ts.FunctionDeclaration {
	return factory.updateFunctionDeclaration(
		node,
		node.decorators,
		node.modifiers,
		node.asteriskToken,
		node.name,
		node.typeParameters,
		node.parameters,
		node.type,
		body,
	)
}

function update(f: ts.NodeFactory, sourceFile: ts.SourceFile, node: ts.MethodDeclaration | ts.FunctionDeclaration): ts.Block {
	return f.createBlock(
		f.createNodeArray(
			[].concat(
				f.createCallExpression(
					f.createPropertyAccessExpression(
						f.createPropertyAccessExpression(
							f.createIdentifier('service_conductor_1'),
							f.createIdentifier('default'),
						),
						f.createIdentifier('run'),
					),
					undefined,
					[f.createStringLiteral(`${node.name.getText(sourceFile)}`)],
				),
				node.body.statements,
			),
			true,
		),
		true
	)
}

export function transformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
	const f = context.factory
	function transform(sourceFile: ts.SourceFile): ts.SourceFile {

		let firstTime = true
		const visitImport = (node: ts.Node): ts.VisitResult<ts.Node> => {
			if (ts.isSourceFile(node) == false && firstTime) {
				firstTime = false
				const declaration = f.createImportDeclaration(
					[],
					[],
					f.createImportClause(
						false,
						undefined,
						f.createNamedImports([
							f.createImportSpecifier(
								undefined,
								f.createIdentifier('__conductor'),
							),
						]),
					),
					f.createStringLiteral('service-conductor'),
				)
				return [declaration, node]
			}
			return ts.visitEachChild(node, (child) => visitImport(child), context)
		}

		const visitCall = (node: ts.Node): ts.VisitResult<ts.Node> => {
			if (ts.isMethodDeclaration(node)) {
				const body = update(f, sourceFile, node)
				return setMethodBody(f, node, body)
			}
			if (ts.isFunctionDeclaration(node)) {
				const body = update(f, sourceFile, node)
				return setFunctionBody(f, node, body)
			}
			return ts.visitEachChild(node, (child) => visitCall(child), context)
		}

		return ts.visitNode(ts.visitNode(sourceFile, visitImport), visitCall)
	}
	return transform
}