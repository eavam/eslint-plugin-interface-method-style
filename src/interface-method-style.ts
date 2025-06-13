import { ESLintUtils } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/types";
import ts from "typescript";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/eavam/eslint-plugin-${name}`,
);

export enum MessageId {
  NeedArrow = "whenUseArrowFunction",
  NeedMethod = "whenUseMethod",
}

interface Options {
  prefer?: "method" | "arrow";
  ignoreStatic?: boolean;
}

type FunctionNode = (
  | TSESTree.MethodDefinition
  | TSESTree.PropertyDefinition
) & {
  key: TSESTree.Identifier;
};

type ObjectMethodNode = TSESTree.Property & {
  key: TSESTree.Identifier;
  value: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
};

const isStatic = (node: FunctionNode | ObjectMethodNode) =>
  "static" in node && !!node.static;
const isMethod = (node: FunctionNode) =>
  node.type === AST_NODE_TYPES.MethodDefinition;
const isArrowFunction = (node: ObjectMethodNode) =>
  node.value.type === AST_NODE_TYPES.ArrowFunctionExpression;

interface MemberInfo {
  name: string;
  node: FunctionNode;
  isStatic: boolean;
  isMethod: boolean;
}

interface InterfaceMethodInfo {
  name: string;
  isMethodSignature: boolean;
  hasOverloads: boolean;
}

export default createRule<[Options], MessageId>({
  name: "interface-method-style",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce strict function signatures by ensuring that class methods and properties strictly adhere to the interfaces they implement.",
    },
    messages: {
      [MessageId.NeedArrow]:
        "Should be an arrow-function property: `{{name}} = () => …`",
      [MessageId.NeedMethod]: "Should be a method: `{{name}}() { … }`",
    },
    schema: [
      {
        type: "object",
        properties: {
          prefer: { type: "string", enum: ["method", "arrow"] },
          ignoreStatic: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ prefer: undefined, ignoreStatic: true }],

  create(context, [{ prefer, ignoreStatic = true }]) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const typeCache = new WeakMap<ts.Type, ts.Symbol[]>();

    const getMethodsInfo = (
      type: ts.Type,
      isAbstract = false,
    ): InterfaceMethodInfo[] => {
      let methods = typeCache.get(type);
      if (!methods) {
        methods = checker.getPropertiesOfType(type);
        if (type.symbol) {
          methods = [
            ...methods,
            ...checker.getPropertiesOfType(
              checker.getDeclaredTypeOfSymbol(type.symbol),
            ),
          ];
        }
        typeCache.set(type, methods);
      }

      return methods
        .map((method) => {
          const declaration = method.getDeclarations()?.[0];
          if (!declaration) return null;

          if (isAbstract) {
            return declaration.kind === ts.SyntaxKind.MethodDeclaration &&
              (declaration as ts.MethodDeclaration).modifiers?.some(
                (mod) => mod.kind === ts.SyntaxKind.AbstractKeyword,
              )
              ? {
                  name: method.name,
                  isMethodSignature: true,
                  hasOverloads: false,
                }
              : null;
          }

          const signatures = checker.getSignaturesOfType(
            checker.getTypeAtLocation(declaration),
            ts.SignatureKind.Call,
          );
          const isFunction =
            declaration.kind === ts.SyntaxKind.MethodSignature ||
            (declaration.kind === ts.SyntaxKind.PropertySignature &&
              signatures.length > 0);

          return isFunction
            ? {
                name: method.name,
                isMethodSignature:
                  declaration.kind === ts.SyntaxKind.MethodSignature,
                hasOverloads: signatures.length > 1,
              }
            : null;
        })
        .filter(Boolean) as InterfaceMethodInfo[];
    };

    const reportError = (
      node: FunctionNode | ObjectMethodNode,
      name: string,
      needMethod: boolean,
    ) => {
      context.report({
        node,
        messageId: needMethod ? MessageId.NeedMethod : MessageId.NeedArrow,
        data: { name },
      });
    };

    const shouldBeMethod = (
      interfaceMethod: InterfaceMethodInfo,
      prefer?: string,
    ) => {
      if (prefer) return prefer === "method";
      return interfaceMethod.hasOverloads || interfaceMethod.isMethodSignature;
    };

    const processClass = (classDecl: TSESTree.ClassDeclaration) => {
      if (!classDecl.body) return;

      const members: MemberInfo[] = [];
      const staticNames = new Set<string>();
      const instanceNames = new Set<string>();

      // Collect members
      for (const member of classDecl.body.body) {
        if (
          !(
            member.type === AST_NODE_TYPES.MethodDefinition ||
            member.type === AST_NODE_TYPES.PropertyDefinition
          ) ||
          member.key.type !== AST_NODE_TYPES.Identifier ||
          (member.type === AST_NODE_TYPES.MethodDefinition &&
            ["get", "set", "constructor"].includes(member.kind))
        ) {
          continue;
        }

        // Skip non-function properties
        if (member.type === AST_NODE_TYPES.PropertyDefinition) {
          const hasFunction =
            member.value &&
            [
              AST_NODE_TYPES.FunctionExpression,
              AST_NODE_TYPES.ArrowFunctionExpression,
            ].includes(member.value.type);
          if (!hasFunction && !member.definite) continue;
        }

        const memberInfo: MemberInfo = {
          name: member.key.name,
          node: member as FunctionNode,
          isStatic: isStatic(member as FunctionNode),
          isMethod: isMethod(member as FunctionNode),
        };

        members.push(memberInfo);
        (memberInfo.isStatic ? staticNames : instanceNames).add(
          memberInfo.name,
        );
      }

      // Get interface methods
      const interfaceMethods: InterfaceMethodInfo[] = [];

      classDecl.implements?.forEach((implement) => {
        const type = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(implement),
        );
        interfaceMethods.push(...getMethodsInfo(type));
      });

      if (classDecl.superClass) {
        const superType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(classDecl.superClass),
        );
        interfaceMethods.push(...getMethodsInfo(superType, true));
      }

      // Process members
      for (const member of members) {
        if (member.isStatic && ignoreStatic) continue;

        if (
          ignoreStatic &&
          ((member.isStatic && instanceNames.has(member.name)) ||
            (!member.isStatic && staticNames.has(member.name)))
        ) {
          continue;
        }

        const interfaceMethod = interfaceMethods.find(
          (m) => m.name === member.name,
        );
        if (!interfaceMethod) continue;

        const needMethod = shouldBeMethod(interfaceMethod, prefer);
        if (member.isMethod !== needMethod) {
          reportError(member.node, member.name, needMethod);
        }
      }
    };

    const processObjectMethod = (node: ObjectMethodNode) => {
      if (node.parent.type !== AST_NODE_TYPES.ObjectExpression) return;

      const objectType = checker.getContextualType(
        parserServices.esTreeNodeToTSNodeMap.get(node.parent),
      );
      if (!objectType) return;

      const symbol = checker.getPropertyOfType(objectType, node.key.name);
      const declaration = symbol?.declarations?.[0];
      if (!declaration) return;

      if (prefer) {
        const needArrow = prefer === "arrow";
        if (isArrowFunction(node) !== needArrow) {
          reportError(node, node.key.name, !needArrow);
        }
        return;
      }

      const isMethodSig = declaration.kind === ts.SyntaxKind.MethodSignature;
      const isPropertySig =
        declaration.kind === ts.SyntaxKind.PropertySignature;

      if (isMethodSig && isArrowFunction(node)) {
        reportError(node, node.key.name, true);
      } else if (isPropertySig) {
        const signatures = checker.getSignaturesOfType(
          checker.getTypeAtLocation(declaration),
          ts.SignatureKind.Call,
        );
        if (signatures.length > 0 && !isArrowFunction(node)) {
          reportError(node, node.key.name, false);
        }
      }
    };

    return {
      ClassDeclaration: processClass,
      ":matches(Property)[key.name][value.type=/^(FunctionExpression|ArrowFunctionExpression)$/]":
        processObjectMethod,
    };
  },
});
