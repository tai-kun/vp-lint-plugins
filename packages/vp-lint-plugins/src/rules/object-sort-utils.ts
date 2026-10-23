import type { ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";

type SortableObject = ESTree.ObjectExpression | ESTree.ObjectPattern;

type SortableProperty = SortableObject["properties"][number];

interface SortPlanOptions {
  /**
   * 末尾の RestElement を許可するかどうかです。
   */
  allowRest?: boolean;

  /**
   * 1 行のオブジェクトを複数行に整形するかどうかです。
   */
  forceMultiline?: boolean;
}

interface SortUnit {
  endLine: number;
  name: string | null;
  property: SortableProperty;
  startLine: number;
  text: string;
}

type NamedSortUnit = SortUnit & { name: string };

type SortPlan =
  | {
      needsFix: false;
      replacement: null;
    }
  | {
      needsFix: true;
      replacement: string;
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

/**
 * オブジェクトリテラル／オブジェクトパターンの並び替え計画を返します。
 *
 * - プロパティー名の長さが短い順、同じ長さなら名前順
 * - 空行で区切られたグループ内だけで並び替え
 * - プロパティー直上のコメントはプロパティーと一緒に移動
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
  const lineIndent = getLineIndent(source, lineStarts, node.loc.start.line);
  const comments = sourceCode
    .getAllComments()
    .filter((comment) => comment.range[0] >= node.range[0] && comment.range[1] <= node.range[1]);
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
        startLine: property.loc.start.line,
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
        comments.some(
          (comment) =>
            comment.loc.start.line === previous.loc.end.line &&
            comment.range[0] >= previous.range[1] &&
            comment.range[1] <= property.range[0],
        )
      ) {
        return null;
      }

      const attached: Comment[] = [];
      let expectedLine = property.loc.start.line;

      for (let index = candidates.length - 1; index >= 0; index -= 1) {
        const comment = candidates[index];

        if (comment === undefined) {
          continue;
        }

        if (comment.loc.end.line !== expectedLine && comment.loc.end.line !== expectedLine - 1) {
          return null;
        }

        if (comment.loc.start.line === expectedLine) {
          return null;
        }

        if (comment.loc.start.line === node.loc.start.line) {
          return null;
        }

        attached.unshift(comment);
        expectedLine = comment.loc.start.line;
      }

      if (attached.length !== candidates.length) {
        return null;
      }

      const first = attached[0] ?? property;
      const startLine = first.loc.start.line;
      const unitStart = lineStarts[startLine - 1] ?? 0;
      const isRest = property.type === "RestElement";

      units.push({
        name: isRest ? null : getPropertyName(property),
        text: source.slice(unitStart, property.range[1]),
        endLine: property.loc.end.line,
        property,
        startLine,
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

  let needsSort = false;

  for (const group of groups) {
    const sorted = sortGroup(group);

    if (sorted.some((unit, index) => unit !== group[index])) {
      needsSort = true;
      break;
    }
  }

  const needsFormat = forceMultiline && inlineStart;

  if (!needsSort && !needsFormat) {
    return {
      needsFix: false,
      replacement: null,
    };
  }

  if (singleLine && !forceMultiline) {
    const sortedUnits = sortGroup(units);

    return {
      needsFix: true,
      replacement: `{ ${sortedUnits.map((unit) => unit.text).join(", ")} }`,
    };
  }

  const groupsText = groups
    .map((group) =>
      sortGroup(group)
        .map((unit) => unit.text)
        .join(",\n"),
    )
    .join(",\n\n");
  const lastUnit = groups.flatMap((group) => sortGroup(group)).at(-1);
  const trailingComma = lastUnit?.property.type === "RestElement" ? "" : ",";

  return {
    needsFix: true,
    replacement: `{\n${groupsText}${trailingComma}\n${lineIndent}}`,
  };
}

export { getSortPlan, compareNames };
