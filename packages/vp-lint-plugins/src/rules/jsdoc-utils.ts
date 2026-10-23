import type { ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";

import { isFence } from "./comment-utils.js";

interface JSDocLine {
  content: string;
  prefix: string;
  raw: string;
  tagName: string | null;
}

function getTagName(text: string): string | null {
  const match = /^@(?<tag>[A-Za-z][\w-]*)/u.exec(text.trimStart());

  return match?.groups?.["tag"] ?? null;
}

function stripType(value: string): string {
  if (!value.startsWith("{")) {
    return value;
  }

  let depth = 0;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return value.slice(index + 1).trimStart();
      }
    }
  }

  return value;
}

/**
 * `@param` 行からパラメーター名を取得します。
 */
function getParamName(content: string): string | null {
  let value = content.trimStart();

  if (getTagName(value) !== "param") {
    return null;
  }

  value = stripType(value.slice("@param".length).trimStart());

  const match = /^(?<name>\S+)/u.exec(value);
  const name = match?.groups?.["name"] ?? null;

  if (name === null) {
    return null;
  }

  return name
    .replace(/^\[/u, "")
    .replace(/\]$/u, "")
    .replace(/^\.\.\./u, "")
    .replace(/=.*$/u, "");
}

/**
 * JSDoc コメントの各行を返します。
 *
 * JSDoc でない場合や、`*` の付かない行がある場合は null を返します。
 */
function getJSDocLines(comment: Comment, sourceCode: SourceCode): JSDocLine[] | null {
  const raw = sourceCode.getText(comment);

  if (!raw.startsWith("/**") || comment.type !== "Block") {
    return null;
  }

  const rawLines = raw.split("\n");

  if (rawLines.length === 1) {
    const contentStart = 3;
    const contentEnd = raw.lastIndexOf("*/");
    const content = raw.slice(contentStart, contentEnd);

    return [
      {
        raw,
        prefix: raw.slice(0, contentStart),
        content,
        tagName: getTagName(content),
      },
    ];
  }

  const lines: JSDocLine[] = [];

  for (const [index, line] of rawLines.entries()) {
    if (index === 0) {
      const contentStart = 3;
      const closeIndex = line.lastIndexOf("*/");
      const contentEnd = closeIndex === -1 ? line.length : Math.max(contentStart, closeIndex);
      const content = line.slice(contentStart, contentEnd);

      lines.push({
        raw: line,
        prefix: line.slice(0, contentStart),
        content,
        tagName: getTagName(content),
      });
      continue;
    }

    const match = /^(?<prefix>\s*\*[ \t]?).*$/u.exec(line);

    if (match === null) {
      return null;
    }

    const prefix = match.groups?.["prefix"] ?? "";
    const contentStart = prefix.length;
    const closeIndex = line.lastIndexOf("*/");
    const contentEnd = closeIndex === -1 ? line.length : Math.max(contentStart, closeIndex);
    const content = line.slice(contentStart, contentEnd);

    lines.push({
      raw: line,
      prefix,
      content,
      tagName: getTagName(content),
    });
  }

  return lines;
}

function hasExampleOrFence(lines: readonly JSDocLine[]): boolean {
  return lines.some((line) => line.tagName === "example" || isFence(line.content));
}

function getNodeStart(node: ESTree.Node): number {
  if ("decorators" in node) {
    const decorator = node.decorators?.[0];

    if (decorator !== undefined) {
      return decorator.range[0];
    }
  }

  return node.range[0];
}

/**
 * ノードに付いている JSDoc コメントを返します。
 */
function getNodeJSDoc(node: ESTree.Node, sourceCode: SourceCode): Comment | null {
  const start = getNodeStart(node);
  const comment = sourceCode.getAllComments().findLast((candidate) => candidate.range[1] <= start);

  if (comment === null || comment === undefined || comment.type !== "Block") {
    return null;
  }

  if (!sourceCode.getText(comment).startsWith("/**")) {
    return null;
  }

  if (sourceCode.text.slice(comment.range[1], start).trim() !== "") {
    return null;
  }

  const startLine = sourceCode.getLocFromIndex(start).line;

  return comment.loc.end.line === startLine - 1 ? comment : null;
}

export type { JSDocLine };

export { getTagName, getNodeJSDoc, getParamName, getJSDocLines, hasExampleOrFence };
