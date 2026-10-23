#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const [, , repository, currentTag, previousTag = "", target = "HEAD"] = process.argv;

const SECTIONS = [
  {
    title: "新機能",
    types: ["feat"],
  },
  {
    title: "バグ修正",
    types: ["fix"],
  },
  {
    title: "パフォーマンス改善",
    types: ["perf"],
  },
  {
    title: "リファクタリング",
    types: ["refactor"],
  },
  {
    title: "ドキュメント",
    types: ["docs"],
  },
  {
    title: "テスト",
    types: ["test"],
  },
  {
    title: "ビルド・CI",
    types: ["build", "ci"],
  },
  {
    title: "その他",
    types: [],
  },
];

const RELEASE_PATTERN = /^release(?:\([^)]*\))?!?:\s*/iu;
const EMPTY_PATTERN = /^[\s.]*$/u;
const CONVENTIONAL_PATTERN =
  /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]*)\))?!?:\s*(?<description>.+)$/u;
const BARE_TYPE_PATTERN = /^(?:feat|fix|perf|refactor|docs|test|build|ci|style|chore|revert)$/iu;

const range = previousTag === "" ? target : `${previousTag}..${target}`;
const log = execFileSync("git", ["log", "--no-merges", "--format=%H%x1f%s", range], {
  encoding: "utf8",
});

const groups = new Map(SECTIONS.map(({ title }) => [title, []]));

for (const line of log.split("\n")) {
  if (line === "") {
    continue;
  }

  const [hash, subject] = line.split("\u001F");

  if (EMPTY_PATTERN.test(subject) || RELEASE_PATTERN.test(subject)) {
    continue;
  }

  const match = CONVENTIONAL_PATTERN.exec(subject);
  const type = (
    match?.groups?.type ?? (BARE_TYPE_PATTERN.test(subject) ? subject : "")
  ).toLowerCase();
  const scope = match?.groups?.scope;
  const description = match?.groups?.description ?? subject;
  const section = SECTIONS.find(({ types }) => types.includes(type)) ?? SECTIONS.at(-1);
  const shortHash = hash.slice(0, 7);
  const link = `https://github.com/${repository}/commit/${hash}`;
  const prefix = scope === undefined ? "" : `**${scope}:** `;
  groups.get(section.title).push(`- ${prefix}${description} ([${shortHash}](${link}))`);
}

const blocks = [];

for (const { title } of SECTIONS) {
  const items = groups.get(title);

  if (items.length === 0) {
    continue;
  }

  blocks.push([`### ${title}`, "", ...items].join("\n"));
}

const compareURL =
  previousTag === ""
    ? `https://github.com/${repository}/commits/${currentTag}`
    : `https://github.com/${repository}/compare/${previousTag}...${currentTag}`;
blocks.push(`**Full Changelog**: ${compareURL}`);

process.stdout.write(blocks.join("\n\n"));
