import type { Comment, SourceCode } from "vite-plus/lint/plugins";

interface CommentLine {
  column: number;
  content: string;
  end: number;
  line: number;
  start: number;
}

// ラベル行とは別に、閉じ括弧付きのコロン終わりも文末とします。
const SENTENCE_END = /[。．.!?！？:：)…]$/u;
const TRAILING_CLOSERS = /[」』】）》）〕〉］｝"'”’]+$/u;
const DIRECTIVE_PREFIXES = [
  "#!",
  "///",
  "oxlint-",
  "eslint-",
  "prettier-",
  "@ts-",
  "@type",
  "@see",
  "@link",
  "TODO",
  "FIXME",
  "#__PURE__",
  "NOTE",
  "HACK",
  "XXX",
  "istanbul",
  "c8 ",
  "v8 ",
  "#region",
  "#endregion",
  "biome-",
  "deno-",
];

function isBlank(text: string): boolean {
  return text.trim() === "";
}

function isDirective(text: string): boolean {
  const value = text.trimStart();

  return DIRECTIVE_PREFIXES.some((prefix) => value.indexOf(prefix) === 0);
}

function isLabelLine(text: string): boolean {
  const value = text.trim();

  return /^[^\s:：]{1,20}[:：]\s/u.test(value) || /[:：]$/u.test(value);
}

function isTag(text: string): boolean {
  return /^@[A-Za-z]/u.test(text.trimStart());
}

function isListOrHeading(text: string): boolean {
  return /^(?:[-*+]\s|\d+[.)]\s|#{1,6}\s|\|)/u.test(text.trimStart());
}

function isCodeLike(text: string): boolean {
  const value = text.trimStart();

  return (
    /^(?:```|~~~|const |let |var |function |return |if \(|for \(|while \(|switch \(|class |import |export |type |interface |\{|\}|\$ |> |pnpm |npm |npx |node |git |mise |yarn |bun |deno |curl |cd |echo |sudo |https?:\/\/)/u.test(
      value,
    ) || /=>|;\s*$/u.test(value)
  );
}

function isFence(text: string): boolean {
  const value = text.trimStart();

  return value.slice(0, 3) === "```" || value.slice(0, 3) === "~~~";
}

function isSentenceEnd(text: string): boolean {
  const value = text.trimEnd().replace(TRAILING_CLOSERS, "");

  return SENTENCE_END.test(value);
}

/**
 * 散文として扱わない行かどうかを返します。
 */
function isSkippableProseLine(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed === "" || isFence(trimmed)) {
    return true;
  }

  return (
    isDirective(trimmed) ||
    isLabelLine(trimmed) ||
    isTag(trimmed) ||
    isListOrHeading(trimmed) ||
    isCodeLike(trimmed)
  );
}

function getBlockLineInfos(comment: Comment, sourceCode: SourceCode): (CommentLine | null)[] {
  const raw = sourceCode.getText(comment);

  if (!raw.includes("\n")) {
    return [];
  }

  const lines = raw.split("\n");
  const infos: (CommentLine | null)[] = [];
  let offset = comment.range[0];

  for (const [index, line] of lines.entries()) {
    let contentStart: number;
    let contentEnd = line.length;

    if (index === 0) {
      contentStart = raw.slice(0, 3) === "/**" ? 3 : 2;
    } else {
      const match = /^(?<prefix>\s*\*[ \t]?).*$/u.exec(line);

      if (match === null) {
        infos.push(null);
        offset += line.length + 1;
        continue;
      }

      contentStart = match.groups?.["prefix"]?.length ?? 0;
      const closeIndex = line.indexOf("*/");

      if (closeIndex !== -1) {
        contentEnd = Math.max(contentStart, closeIndex);
      }
    }

    infos.push({
      end: offset + contentEnd,
      line: comment.loc.start.line + index,
      start: offset + contentStart,
      column: index === 0 ? comment.loc.start.column + contentStart : contentStart,
      content: line.slice(contentStart, contentEnd),
    });
    offset += line.length + 1;
  }

  return infos;
}

function getLineGroupInfos(group: readonly Comment[], sourceCode: SourceCode): CommentLine[] {
  return group.map((comment) => {
    const raw = sourceCode.getText(comment);
    const commentPrefix = raw.slice(0, 2) === "//" ? 2 : 0;
    const spacePrefix = raw[commentPrefix] === " " ? 1 : 0;
    const contentStart = commentPrefix + spacePrefix;

    return {
      end: comment.range[1],
      line: comment.loc.start.line,
      start: comment.range[0] + contentStart,
      column: comment.loc.start.column + contentStart,
      content: raw.slice(contentStart),
    };
  });
}

function getSingleLineBlockInfo(comment: Comment, sourceCode: SourceCode): CommentLine {
  const raw = sourceCode.getText(comment);
  const prefixLength = raw.startsWith("/**") ? 3 : 2;
  const closeIndex = raw.lastIndexOf("*/");
  const contentEnd = closeIndex === -1 ? raw.length : closeIndex;

  return {
    end: comment.range[0] + contentEnd,
    line: comment.loc.start.line,
    start: comment.range[0] + prefixLength,
    column: comment.loc.start.column + prefixLength,
    content: raw.slice(prefixLength, contentEnd),
  };
}

/**
 * コメントの内容行を返します。
 *
 * ブロックコメントで `*` の付かない行がある場合は、その行を null として返します。
 */
function getCommentLineInfos(comment: Comment, sourceCode: SourceCode): (CommentLine | null)[] {
  if (comment.type === "Line") {
    return getLineGroupInfos([comment], sourceCode);
  }

  if (comment.type === "Shebang") {
    return [];
  }

  const raw = sourceCode.getText(comment);

  if (!raw.includes("\n")) {
    return [getSingleLineBlockInfo(comment, sourceCode)];
  }

  return getBlockLineInfos(comment, sourceCode);
}

export type { CommentLine };

export {
  isTag,
  isBlank,
  isFence,
  isCodeLike,
  isDirective,
  isLabelLine,
  isSentenceEnd,
  isListOrHeading,
  getLineGroupInfos,
  getCommentLineInfos,
  isSkippableProseLine,
};
