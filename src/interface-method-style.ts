import { ESLintUtils } from "@typescript-eslint/utils";
import { AST_NODE_TYPES } from "@typescript-eslint/types";
import ts from "typescript";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/eavam/eslint-plugin-${name}`,
);

export const rule = createRule({
  name: "interface-method-style",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce strict function signatures by ensuring that class methods and properties strictly adhere to the interfaces they implement.",
    },
    messages: {
      whenUseArrowFunction: "Function signature should be strict",
      whenUseMethod: "Function signature should be strict",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const typeCache = new Map<ts.Type, ts.Symbol[]>();

    return {
      // :matches(MethodDefinition, PropertyDefinition, Property)
      ClassBody: (node) => {
        node.parent.implements?.forEach((implement) => {
          const implementType = checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(implement),
          );

          let interfaceMethods = typeCache.get(implementType);
          if (!interfaceMethods) {
            interfaceMethods = checker.getPropertiesOfType(implementType);
            typeCache.set(implementType, interfaceMethods);
          }

          node.body.forEach((classElement) => {
            if (
              classElement.type === AST_NODE_TYPES.MethodDefinition &&
              classElement.key.type === AST_NODE_TYPES.Identifier
            ) {
              const methodName = classElement.key.name;
              const implementedMethod = interfaceMethods.find(
                (method) => method.name === methodName,
              );

              if (!implementedMethod) return;

              const declaration = implementedMethod.declarations?.[0];
              if (
                !declaration ||
                declaration.kind !== ts.SyntaxKind.MethodSignature
              ) {
                context.report({
                  node: classElement,
                  messageId: "whenUseMethod",
                });
              }
            }

            if (
              classElement.type === AST_NODE_TYPES.PropertyDefinition &&
              classElement.key.type === AST_NODE_TYPES.Identifier
            ) {
              const classPropertyName = classElement.key.name;
              const implementedProperty = interfaceMethods.find(
                (property) => property.name === classPropertyName,
              );

              if (!implementedProperty) return;

              const declaration = implementedProperty.declarations?.[0];
              if (
                !declaration ||
                declaration.kind !== ts.SyntaxKind.PropertySignature
              ) {
                context.report({
                  node: classElement,
                  messageId: "whenUseArrowFunction",
                });
              }
            }
          });
        });
      },
    };
  },
});
