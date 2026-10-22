function getLineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") {
      starts.push(index + 1);
    }
  }

  return starts;
}

function getLineIndent(text, lineStarts, line) {
  const start = lineStarts[line - 1] ?? 0;
  const match = /^[ \t]*/u.exec(text.slice(start));

  return match === null ? "" : match[0];
}

function getPropertyName(property) {
  if (property.type !== "Property" || property.computed === true || property.kind !== "init") {
    return null;
  }

  const key = property.key;
  let name;
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

function isSortableObject(node, allowRest) {
  if (node.properties.length < 2) {
    return false;
  }

  const names = new Set();
  for (let index = 0; index < node.properties.length; index += 1) {
    const property = node.properties[index];
    if (property.type === "RestElement") {
      if (allowRest !== true || index !== node.properties.length - 1) {
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

function compareNames(left, right) {
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

function compareUnits(left, right) {
  return compareNames(left.name, right.name);
}

function sortGroup(group) {
  const sortable = group.filter((unit) => unit.sortable === true).sort(compareUnits);
  const rest = group.filter((unit) => unit.sortable === false);

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
function getSortPlan(node, sourceCode, options = {}) {
  const { allowRest = false, forceMultiline = true } = options;
  if (!isSortableObject(node, allowRest)) {
    return null;
  }

  const source = sourceCode.text;
  const lineStarts = getLineStarts(source);
  const lineIndent = getLineIndent(source, lineStarts, node.loc.start.line);
  /**
   * @type {Array<{ range: [number, number], loc: { start: { line: number }, end: { line: number } } }>}
   */
  const comments = sourceCode
    .getAllComments()
    .filter((comment) => comment.range[0] >= node.range[0] && comment.range[1] <= node.range[1]);
  const inlineStart = node.properties[0].loc.start.line === node.loc.start.line;
  const singleLine = node.loc.start.line === node.loc.end.line;

  const units = [];
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
        sortable: !isRest,
        startLine: property.loc.start.line,
      });
    }
  } else {
    let previousProperty = null;
    for (const property of node.properties) {
      const boundary = previousProperty === null ? node.range[0] + 1 : previousProperty.range[1];
      const candidates = comments.filter(
        (comment) => comment.range[0] >= boundary && comment.range[1] <= property.range[0],
      );

      if (
        previousProperty !== null &&
        comments.some(
          (comment) =>
            comment.loc.start.line === previousProperty.loc.end.line &&
            comment.range[0] >= previousProperty.range[1] &&
            comment.range[1] <= property.range[0],
        )
      ) {
        return null;
      }

      const attached = [];
      let expectedLine = property.loc.start.line;
      for (let index = candidates.length - 1; index >= 0; index -= 1) {
        const comment = candidates[index];
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
      const unitStart = lineStarts[startLine - 1];
      const isRest = property.type === "RestElement";
      units.push({
        name: isRest ? null : getPropertyName(property),
        text: source.slice(unitStart, property.range[1]),
        endLine: property.loc.end.line,
        property,
        sortable: !isRest,
        startLine,
      });
      previousProperty = property;
    }

    const lastProperty = node.properties.at(-1);
    if (
      comments.some(
        (comment) =>
          comment.range[0] >= lastProperty.range[1] && comment.range[1] <= node.range[1] - 1,
      )
    ) {
      return null;
    }
  }

  const groups = [];
  let currentGroup = [];
  let previousEndLine = null;
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

  const needsFormat = forceMultiline === true && inlineStart;
  if (!needsSort && !needsFormat) {
    return {
      needsFix: false,
      replacement: null,
    };
  }

  if (singleLine && forceMultiline !== true) {
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
