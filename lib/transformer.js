"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformer = exports.run = void 0;
const typescript_1 = __importDefault(require("typescript"));
const conductor_1 = __importDefault(require("./conductor"));
function run(id) {
    conductor_1.default.methodCallback(id);
}
exports.run = run;
function setMethodBody(factory, node, body) {
    return factory.updateMethodDeclaration(node, node.decorators, node.modifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, body);
}
function setFunctionBody(factory, node, body) {
    return factory.updateFunctionDeclaration(node, node.decorators, node.modifiers, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, body);
}
function createImportDeclaration(f) {
    return f.createImportDeclaration(undefined, undefined, f.createImportClause(false, undefined, f.createNamedImports([f.createImportSpecifier(undefined, f.createIdentifier('__conductor'))])), f.createStringLiteral('service-conductor'));
}
function update(f, sourceFile, node) {
    return f.createBlock(f.createNodeArray([].concat(f.createCallExpression(f.createPropertyAccessExpression(f.createPropertyAccessExpression(f.createIdentifier('service_conductor_1'), f.createIdentifier('default')), f.createIdentifier('run')), undefined, [f.createStringLiteral(`${node.name.getText(sourceFile)}`)]), node.body.statements), true), true);
}
const transformer = context => {
    const f = context.factory;
    function transform(sourceFile) {
        const visitor = (node) => {
            if (typescript_1.default.isMethodDeclaration(node)) {
                const body = update(f, sourceFile, node);
                return setMethodBody(f, node, body);
            }
            if (typescript_1.default.isFunctionDeclaration(node)) {
                const body = update(f, sourceFile, node);
                return setFunctionBody(f, node, body);
            }
            return typescript_1.default.visitEachChild(node, visitor, context);
        };
        sourceFile = f.updateSourceFile(sourceFile, [createImportDeclaration(f), ...sourceFile.statements]);
        return typescript_1.default.visitNode(sourceFile, visitor);
    }
    return transform;
};
exports.transformer = transformer;
//# sourceMappingURL=transformer.js.map