import ts from 'typescript';

function setBody(factory: ts.NodeFactory, node: ts.MethodDeclaration, body: ts.Block): ts.MethodDeclaration {
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
    );
}

const conductorTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const f = context.factory;
    function transform(sourceFile: ts.SourceFile): ts.SourceFile {
        let firstTime = true;
        const visitImport = (node: ts.Node): ts.VisitResult<ts.Node> => {
            if (ts.isSourceFile(node) == false && firstTime) {
                firstTime = false;
                const declaration = f.createImportDeclaration(
                    [],
                    [],
                    f.createImportClause(
                        false,
                        undefined,
                        f.createNamedImports([
                            f.createImportSpecifier(
                                f.createIdentifier('__conductor'),
                                f.createIdentifier('__conductor'),
                            ),
                        ]),
                    ),
                    f.createStringLiteral('service-conductor'),
                );
                return [declaration, node];
            }
            return ts.visitEachChild(node, (child) => visitImport(child), context);
        };

        const visitCall = (node: ts.Node): ts.VisitResult<ts.Node> => {
            if (ts.isMethodDeclaration(node)) {
                const body = f.createBlock(
                    f.createNodeArray(
                        [].concat(
                            f.createCallExpression(
                                f.createPropertyAccessExpression(
                                    f.createIdentifier('service_conductor_1'),
                                    f.createIdentifier('run'),
                                ),
                                undefined,
                                [f.createStringLiteral(`${node.name.getText(sourceFile)}`)],
                            ),
                            node.body.statements,
                        ),
                        false,
                    ),
                );
                return setBody(f, node, body);
            }
            return ts.visitEachChild(node, (child) => visitCall(child), context);
        };

        return ts.visitNode(ts.visitNode(sourceFile, visitImport), visitCall);
    }
    return transform;
};
export { conductorTransformer };
