import type { ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";

import { hasCommentPosition } from "./_comment-utils.js";

type SortableObject = ESTree.ObjectExpression | ESTree.ObjectPattern;

type SortableProperty = SortableObject["properties"][number];

interface SortPlanOptions {
  /** 末尾の RestElement を許可するかどうかです。 */
  allowRest?: boolean;

  /** 1 行のオブジェクトを複数行に整形するかどうかです。 */
  forceMultiline?: boolean;
}

interface SortUnit {
  endLine: number;
  endOffset: number;
  name: string | null;
  property: SortableProperty;
  startLine: number;
  startOffset: number;
  text: string;
}

interface SortEdit {
  end: number;
  start: number;
  text: string;
}

type NamedSortUnit = SortUnit & { name: string };

type SortPlan =
  | {
      edits: null;
      needsFix: false;
      replacement: null;
    }
  | {
      edits: null;
      needsFix: true;
      replacement: string;
    }
  | {
      edits: SortEdit[];
      needsFix: true;
      replacement: null;
    };

function getLineStarts(text: string): number[] {
  const starts = [0];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") {
      starts.push(index + 1);
    }
  }

  return starts;
}

function getLineIndent(text: string, lineStarts: readonly number[], line: number): string {
  const start = lineStarts[line - 1] ?? 0;
  const match = /^[ \t]*/u.exec(text.slice(start));

  return match?.[0] ?? "";
}

function getPropertyName(property: SortableProperty): string | null {
  if (property.type !== "Property" || property.computed || property.kind !== "init") {
    return null;
  }

  const key = property.key;
  let name: string;

  if (key.type === "Identifier") {
    name = key.name;
  } else if (
    key.type === "Literal" &&
    (typeof key.value === "string" || typeof key.value === "number")
  ) {
    name = String(key.value);
  } else {
    return null;
  }

  return name === "__proto__" ? null : name;
}

function isSortableObject(node: SortableObject, allowRest: boolean): boolean {
  if (node.properties.length < 2) {
    return false;
  }

  const names = new Set<string>();

  for (const [index, property] of node.properties.entries()) {
    if (property.type === "RestElement") {
      if (!allowRest || index !== node.properties.length - 1) {
        return false;
      }

      continue;
    }

    const name = getPropertyName(property);

    if (name === null || names.has(name)) {
      return false;
    }

    names.add(name);
  }

  return true;
}

function compareNames(left: string, right: string): number {
  if (left.length !== right.length) {
    return left.length - right.length;
  }

  const leftLower = left.toLowerCase();
  const rightLower = right.toLowerCase();

  if (leftLower !== rightLower) {
    return leftLower < rightLower ? -1 : 1;
  }

  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

function compareUnits(left: NamedSortUnit, right: NamedSortUnit): number {
  return compareNames(left.name, right.name);
}

function sortGroup(group: readonly SortUnit[]): SortUnit[] {
  const sortable = group.filter((unit): unit is NamedSortUnit => unit.name !== null);
  sortable.sort(compareUnits);

  const rest = group.filter((unit) => unit.name === null);

  return [...sortable, ...rest];
}

function splitGroups(units: readonly SortUnit[]): SortUnit[][] {
  const groups: SortUnit[][] = [];
  let currentGroup: SortUnit[] = [];
  let previousEndLine: number | null = null;

  for (const unit of units) {
    if (previousEndLine !== null && unit.startLine > previousEndLine + 1) {
      groups.push(currentGroup);
      currentGroup = [];
    }

    currentGroup.push(unit);
    previousEndLine = unit.endLine;
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function getEditText(units: readonly SortUnit[]): string {
  return units.map((unit) => unit.text).join(",\n");
}

/**
 * オブジェクトリテラル／オブジェクトパターンの並び替え計画を返します。
 *
 * - プロパティー名の長さが短い順、同じ長さなら名前順
 * - 空行で区切られたグループ内だけで並び替え
 * - プロパティー直上のコメントはプロパティーと一緒に移動
 * - 空行を挟んだコメントはグループ見出しとしてその場に残す
 *
 * 並び替えが安全でない場合は null を返します。
 */
function getSortPlan(
  node: SortableObject,
  sourceCode: SourceCode,
  options: SortPlanOptions = {},
): SortPlan | null {
  const { allowRest = false, forceMultiline = true } = options;

  if (!isSortableObject(node, allowRest)) {
    return null;
  }

  const source = sourceCode.text;
  const lineStarts = getLineStarts(source);
  const comments = sourceCode
    .getAllComments()
    .filter(
      (comment) =>
        hasCommentPosition(comment) &&
        comment.range[0] >= node.range[0] &&
        comment.range[1] <= node.range[1],
    );
  const firstProperty = node.properties[0];

  if (firstProperty === undefined) {
    return null;
  }

  const inlineStart = firstProperty.loc.start.line === node.loc.start.line;
  const singleLine = node.loc.start.line === node.loc.end.line;
  const units: SortUnit[] = [];

  if (inlineStart) {
    if (comments.length > 0) {
      return null;
    }

    for (const property of node.properties) {
      const isRest = property.type === "RestElement";
      units.push({
        name: isRest ? null : getPropertyName(property),
        text: source.slice(property.range[0], property.range[1]),
        endLine: property.loc.end.line,
        property,
        endOffset: property.range[1],
        startLine: property.loc.start.line,
        startOffset: property.range[0],
      });
    }
  } else {
    let previousProperty: SortableProperty | null = null;

    for (const property of node.properties) {
      const previous = previousProperty;
      const boundary = previous === null ? node.range[0] + 1 : previous.range[1];
      const candidates = comments.filter(
        (comment) => comment.range[0] >= boundary && comment.range[1] <= property.range[0],
      );

      if (
        previous !== null &&
        candidates.some((comment) => comment.loc.start.line === previous.loc.end.line)
      ) {
        return null;
      }

      if (candidates.some((comment) => comment.loc.start.line === node.loc.start.line)) {
        return null;
      }

      const attached: Comment[] = [];
      let expectedLine = property.loc.start.line;

      for (let index = candidates.length - 1; index >= 0; index -= 1) {
        const comment = candidates[index];

        if (comment === undefined) {
          continue;
        }

        if (comment.loc.end.line === expectedLine) {
          return null;
        }

        if (comment.loc.end.line !== expectedLine - 1) {
          break;
        }

        if (comment.loc.start.line === expectedLine) {
          return null;
        }

        attached.unshift(comment);
        expectedLine = comment.loc.start.line;
      }

      const first = attached[0] ?? property;
      const startLine = first.loc.start.line;
      let startOffset: number;

      if (attached.length > 0) {
        startOffset = lineStarts[startLine - 1] ?? first.range[0];
      } else if (startLine === previous?.loc.end.line) {
        startOffset = property.range[0];
      } else {
        startOffset = lineStarts[startLine - 1] ?? property.range[0];
      }

      let endOffset = property.range[1];

      while (endOffset > property.range[0]) {
        const character = source[endOffset - 1];

        if (character !== "," && character !== ";") {
          break;
        }

        endOffset -= 1;
      }

      const isRest = property.type === "RestElement";
      units.push({
        name: isRest ? null : getPropertyName(property),
        text: source.slice(startOffset, endOffset),
        endLine: property.loc.end.line,
        property,
        endOffset,
        startLine,
        startOffset,
      });

      previousProperty = property;
    }

    const lastProperty = node.properties.at(-1);

    if (lastProperty === undefined) {
      return null;
    }

    if (
      comments.some(
        (comment) =>
          comment.range[0] >= lastProperty.range[1] && comment.range[1] <= node.range[1] - 1,
      )
    ) {
      return null;
    }
  }

  if (inlineStart) {
    const lineIndent = getLineIndent(source, lineStarts, node.loc.start.line);
    const groups = splitGroups(units);
    const needsFormat = forceMultiline;
    const needsSort = groups.some((group) => {
      const sorted = sortGroup(group);

      return sorted.some((unit, index) => unit !== group[index]);
    });

    if (!needsSort && !needsFormat) {
      return {
        edits: null,
        needsFix: false,
        replacement: null,
      };
    }

    if (singleLine && !forceMultiline) {
      const sortedUnits = sortGroup(units);

      return {
        edits: null,
        needsFix: true,
        replacement: `{ ${sortedUnits.map((unit) => unit.text).join(", ")} }`,
      };
    }

    const groupsText = groups.map((group) => getEditText(sortGroup(group))).join(",\n\n");
    const lastUnit = groups.flatMap((group) => sortGroup(group)).at(-1);
    const trailingComma = lastUnit?.property.type === "RestElement" ? "" : ",";

    return {
      edits: null,
      needsFix: true,
      replacement: `{\n${groupsText}${trailingComma}\n${lineIndent}}`,
    };
  }

  const edits: SortEdit[] = [];

  for (const group of splitGroups(units)) {
    const sorted = sortGroup(group);

    if (sorted.every((unit, index) => unit === group[index])) {
      continue;
    }

    const first = group[0];
    const last = group.at(-1);

    if (first === undefined || last === undefined) {
      continue;
    }

    edits.push({
      end: last.endOffset,
      text: getEditText(sorted),
      start: first.startOffset,
    });
  }

  if (edits.length === 0) {
    return {
      edits: null,
      needsFix: false,
      replacement: null,
    };
  }

  return {
    edits,
    needsFix: true,
    replacement: null,
  };
}

export { getSortPlan, compareNames };
