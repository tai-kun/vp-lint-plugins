import { defineRule } from "vite-plus/lint/plugins";
import type { Fix, ESTree, Comment, SourceCode } from "vite-plus/lint/plugins";

import { hasCommentPosition } from "./_comment-utils.js";
import { compareNames } from "./_object-sort-utils.js";

interface MemberUnit {
  endLine: number;
  endOffset: number;
  name: string | null;
  startLine: number;
  startOffset: number;
  text: string;
}

interface SortEdit {
  end: number;
  start: number;
  text: string;
}

type NamedUnit = MemberUnit & { name: string };

function getLineStarts(text: string): number[] {
  const starts = [0];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") {
      starts.push(index + 1);
    }
  }

  return starts;
}

function getMemberName(member: ESTree.TSSignature): string | null {
  if (member.type !== "TSPropertySignature" && member.type !== "TSMethodSignature") {
    return null;
  }

  if (member.computed) {
    return null;
  }

  const key = member.key;

  if (key.type === "Identifier") {
    return key.name;
  }

  if (key.type === "Literal" && (typeof key.value === "string" || typeof key.value === "number")) {
    return String(key.value);
  }

  return null;
}

function getUnits(node: ESTree.TSTypeLiteral, sourceCode: SourceCode): MemberUnit[] | null {
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
  const units: MemberUnit[] = [];
  let previousEnd = node.range[0] + 1;

  for (const [index, member] of node.members.entries()) {
    const previousMember = node.members[index - 1];
    const candidates = comments.filter(
      (comment) => comment.range[0] >= previousEnd && comment.range[1] <= member.range[0],
    );

    if (
      previousMember !== undefined &&
      candidates.some((comment) => comment.loc.start.line === previousMember.loc.end.line)
    ) {
      return null;
    }

    const attached: Comment[] = [];
    let expectedLine = member.loc.start.line;

    for (let commentIndex = candidates.length - 1; commentIndex >= 0; commentIndex -= 1) {
      const comment = candidates[commentIndex];

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

    const first = attached[0] ?? member;
    const startLine = first.loc.start.line;
    let startOffset: number;

    if (attached.length > 0) {
      startOffset = lineStarts[startLine - 1] ?? first.range[0];
    } else if (startLine === node.loc.start.line) {
      startOffset = member.range[0];
    } else {
      startOffset = lineStarts[startLine - 1] ?? member.range[0];
    }

    let endOffset = member.range[1];

    while (endOffset > member.range[0]) {
      const character = source[endOffset - 1];

      if (character !== ";" && character !== ",") {
        break;
      }

      endOffset -= 1;
    }

    units.push({
      name: getMemberName(member),
      text: source.slice(startOffset, endOffset),
      endLine: member.loc.end.line,
      endOffset,
      startLine,
      startOffset,
    });
    previousEnd = member.range[1];
  }

  if (
    comments.some(
      (comment) => comment.range[0] >= previousEnd && comment.range[1] <= node.range[1] - 1,
    )
  ) {
    return null;
  }

  return units;
}

function splitGroups(units: readonly MemberUnit[]): MemberUnit[][] {
  const groups: MemberUnit[][] = [];
  let current: MemberUnit[] = [];
  let previousEndLine: number | null = null;

  for (const unit of units) {
    if (previousEndLine !== null && unit.startLine > previousEndLine + 1) {
      groups.push(current);
      current = [];
    }

    current.push(unit);
    previousEndLine = unit.endLine;
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

function sortGroup(group: readonly MemberUnit[]): MemberUnit[] {
  const sortable = group.filter((unit): unit is NamedUnit => unit.name !== null);
  sortable.sort((left, right) => compareNames(left.name, right.name));

  const rest = group.filter((unit) => unit.name === null);

  return [...sortable, ...rest];
}

function getSortEdits(units: readonly MemberUnit[]): SortEdit[] {
  const edits: SortEdit[] = [];
  let runStart = 0;

  while (runStart < units.length) {
    if (units[runStart]?.name === null) {
      runStart += 1;
      continue;
    }

    let runEnd = runStart;

    while (runEnd < units.length && units[runEnd]?.name !== null) {
      runEnd += 1;
    }

    const run = units.slice(runStart, runEnd);

    if (run.length >= 2) {
      const names = new Set<string>();
      let hasDuplicate = false;

      for (const unit of run) {
        if (unit.name === null) {
          continue;
        }

        if (names.has(unit.name)) {
          hasDuplicate = true;
          break;
        }

        names.add(unit.name);
      }

      if (!hasDuplicate) {
        const groups = splitGroups(run);
        const sortedGroups = groups.map(sortGroup);
        const changed = sortedGroups.some((group, groupIndex) =>
          group.some((unit, unitIndex) => unit !== groups[groupIndex]?.[unitIndex]),
        );
        const firstUnit = run[0];
        const lastUnit = run.at(-1);

        if (changed && firstUnit !== undefined && lastUnit !== undefined) {
          edits.push({
            end: lastUnit.endOffset,
            text: sortedGroups
              .map((group) => group.map((unit) => unit.text).join(";\n"))
              .join(";\n\n"),
            start: firstUnit.startOffset,
          });
        }
      }
    }

    runStart = runEnd;
  }

  return edits;
}

/**
 * 型リテラルのメンバーを、名前の長さが短い順、同じ長さなら名前順に並べます。
 *
 * `interface` は対象外です。
 */
const sortTypeMembers = defineRule({
  meta: {
    docs: {
      description: "Sort type literal members by name length and name.",
    },
    type: "layout",
    fixable: "whitespace",
    messages: {
      sort: "Type members must be sorted by name length, then by name.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      TSTypeLiteral(node): void {
        const units = getUnits(node, sourceCode);

        if (units === null) {
          return;
        }

        const edits = getSortEdits(units);

        if (edits.length === 0) {
          return;
        }

        context.report({
          fix(fixer) {
            const fixes: Fix[] = [];

            for (const edit of edits) {
              fixes.push(fixer.replaceTextRange([edit.start, edit.end], edit.text));
            }

            return fixes;
          },
          node,
          messageId: "sort",
        });
      },
    };
  },
});

export default sortTypeMembers;
