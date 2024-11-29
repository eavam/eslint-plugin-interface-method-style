import { ESLintUtils } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/types";
import ts from "typescript";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/eavam/eslint-plugin-${name}`,
);

type FunctionNode =
  | (TSESTree.MethodDefinition & { key: TSESTree.Identifier })
  | (TSESTree.PropertyDefinition & {
      key: TSESTree.Identifier;
      value: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
    });

type ObjectMethodNode = TSESTree.Property & {
  key: TSESTree.Identifier;
  value: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
};

export const rule = createRule({
  name: "interface-method-style",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce strict function signatures by ensuring that class methods and properties strictly adhere to the interfaces they implement.",
    },
    messages: {
      whenUseArrowFunction:
        "This property should be implemented as an arrow function. Example: 'propertyName = () => void' instead of 'propertyName() {}'",
      whenUseMethod:
        "This should be implemented as a regular method. Example: 'methodName() {}' instead of 'methodName = () => {}'",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const typeCache = new Map<ts.Type, ts.Symbol[]>();

    return {
      ":matches(ClassProperty, MethodDefinition, PropertyDefinition)[key.name][value.type=/^(FunctionExpression|ArrowFunctionExpression)$/][kind!=/^(get|set|constructor)$/]":
        (node: FunctionNode) => {
          const parentNode = node.parent;

          if (!parentNode || parentNode.type !== AST_NODE_TYPES.ClassBody) {
            return;
          }

          const classDecl = parentNode.parent;
          if (
            !classDecl ||
            classDecl.type !== AST_NODE_TYPES.ClassDeclaration
          ) {
            return;
          }

          if (!classDecl.implements?.length) {
            return;
          }

          classDecl.implements.forEach((implement) => {
            const implementType = checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap.get(implement),
            );

            let interfaceMethods = typeCache.get(implementType);
            if (!interfaceMethods) {
              interfaceMethods = checker.getPropertiesOfType(implementType);
              typeCache.set(implementType, interfaceMethods);
            }

            const elementName = node.key.name;
            const implementedElement = interfaceMethods.find(
              (method) => method.name === elementName,
            );

            if (!implementedElement) return;

            const declaration = implementedElement.declarations?.[0];
            if (!declaration) return;

            const propertyType = checker.getTypeAtLocation(declaration);
            const signatures = checker.getSignaturesOfType(
              propertyType,
              ts.SignatureKind.Call,
            );

            if (declaration.kind === ts.SyntaxKind.MethodSignature) {
              if (node.type !== AST_NODE_TYPES.MethodDefinition) {
                context.report({
                  node,
                  messageId: "whenUseMethod",
                });
              }
            }

            if (
              declaration.kind === ts.SyntaxKind.PropertySignature &&
              signatures.length > 0
            ) {
              if (node.type !== AST_NODE_TYPES.PropertyDefinition) {
                context.report({
                  node,
                  messageId: "whenUseArrowFunction",
                });
              }
            }
          });
        },
      ":matches(Property)[key.name][value.type=/^(FunctionExpression|ArrowFunctionExpression)$/]":
        (node: ObjectMethodNode) => {
          if (node.parent.type !== AST_NODE_TYPES.ObjectExpression) {
            return;
          }

          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.parent);
          const objectType = checker.getContextualType(tsNode);
          
          if (!objectType) {
            return;
          }

          const symbol = checker.getPropertyOfType(objectType, node.key.name);
          if (!symbol?.declarations?.[0]) {
            return;
          }

          const declaration = symbol.declarations[0];

          if (declaration.kind === ts.SyntaxKind.MethodSignature) {
            if (node.value.type === AST_NODE_TYPES.ArrowFunctionExpression) {
              context.report({
                node,
                messageId: "whenUseMethod",
              });
            }
          }
          
          if (declaration.kind === ts.SyntaxKind.PropertySignature) {
            const propertyType = checker.getTypeAtLocation(declaration);
            const signatures = checker.getSignaturesOfType(
              propertyType,
              ts.SignatureKind.Call,
            );
            
            if (signatures.length > 0 && node.value.type === AST_NODE_TYPES.FunctionExpression) {
              context.report({
                node,
                messageId: "whenUseArrowFunction",
              });
            }
          }
        },
    };
  },
});
