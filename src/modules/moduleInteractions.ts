import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { readFileSafe, formatErrorMessage } from "../utils/helpers";

export async function getModuleInteractions(
  filePath: string
): Promise<string[]> {
  if (!filePath) return ["Not available"];

  const code = await readFileSafe(filePath);
  if (!code) return ["Unable to read file"];
  if (code.length > 1_000_000) return ["File too large to parse"];
  try {
    const ast = parse(code, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript", "dynamicImport"],
    });

    const interactions: string[] = [];

    traverse(ast, {
      ImportDeclaration(path) {
        interactions.push(`Static import: ${path.node.source.value}`);
      },
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.type === "Import" &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === "StringLiteral"
        ) {
          interactions.push(`Dynamic import: ${path.node.arguments[0].value}`);
        } else if (
          callee.type === "Identifier" &&
          callee.name === "require" &&
          path.node.arguments.length > 0 &&
          path.node.arguments[0].type === "StringLiteral"
        ) {
          interactions.push(
            `CommonJS require: ${path.node.arguments[0].value}`
          );
        }
      },
    });

    return interactions.length
      ? interactions
      : ["No module interactions detected"];
  } catch (err) {
    return [`Unable to parse: ${formatErrorMessage(err)}`];
  }
}
