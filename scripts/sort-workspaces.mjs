#!/usr/bin/env node
/**
 * Sort the `workspaces` array in the root `package.json` in topological order so that a workspace always comes after the workspaces it depends on.
 *
 * Runtime dependencies only (`dependencies` + `peerDependencies` + `optionalDependencies`). `devDependencies` are ignored because they would needlessly push leaf packages such as `@unikvs/testing` to the front.
 *
 * Usage: node scripts/sort-workspaces.mjs [--check] [--root <dir>]
 *
 * - Without flags: rewrite `package.json` in place when the order changes.
 * - `--check`: exit 1 (without writing) when the order would change.
 *   This is what `mise run test:sort-workspaces` relies on.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const RUNTIME_DEP_KEYS = ["dependencies", "peerDependencies", "optionalDependencies"];

function printHelp() {
  console.log(`Sort package.json workspaces in topological order.

Usage:
  node scripts/sort-workspaces.mjs [--check] [--root <dir>]

Options:
  --check       Exit 1 without writing when the order would change.
  --root <dir>  Repository root holding package.json (default: cwd).
  -h, --help    Show this help.`);
}

function compareNames(a, b) {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}

/**
 * @param {string[]} argv
 *
 * @returns {{ check: boolean, root: string }}
 */
function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    check: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--check") {
      args.check = true;
    } else if (arg === "--root") {
      const value = argv[++i];

      if (value === undefined || value === "") {
        throw new Error("Missing value for --root");
      }

      args.root = path.resolve(value);
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

/**
 * @param {string} root
 * @param {string} pattern
 *
 * @returns {Promise<string[]>}
 */
async function expandPattern(root, pattern) {
  if (!pattern.includes("*")) {
    return [pattern];
  }

  // Support `*` within a single path segment (e.g. `packages/*`).
  const segments = pattern.split("/");
  const starIndex = segments.findIndex((s) => s.includes("*"));
  const baseDir = path.join(root, ...segments.slice(0, starIndex));
  const rest = segments.slice(starIndex);
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const results = [];
  const regex = new RegExp(
    `^${rest[0].replaceAll(/[.+^${}()|[\]\\]/gu, "\\$&").replaceAll("*", "[^/]*")}$`,
    "u",
  );

  for (const entry of entries) {
    if (!entry.isDirectory() || !regex.test(entry.name)) {
      continue;
    }

    if (rest.length === 1) {
      results.push(path.relative(root, path.join(baseDir, entry.name)));
    } else {
      const subPattern = [entry.name, ...rest.slice(1)].join("/");
      const baseRel = path.relative(root, baseDir);
      const prefix = baseRel === "" ? "" : `${baseRel}/`;

      for (const sub of await expandPattern(root, `${prefix}${subPattern}`)) {
        results.push(sub);
      }
    }
  }

  // Confirm each match actually holds a package.json.
  const confirmed = [];

  for (const dir of results) {
    try {
      await fs.access(path.join(root, dir, "package.json"));
      confirmed.push(dir);
    } catch {
      // Not a package directory; skip.
    }
  }

  return confirmed;
}

async function main() {
  const { root, check } = parseArgs(process.argv.slice(2));
  const rootPkgPath = path.join(root, "package.json");
  const rootPkg = JSON.parse(await fs.readFile(rootPkgPath, "utf8"));

  if (!Array.isArray(rootPkg.workspaces)) {
    throw new TypeError("Root package.json has no `workspaces` array.");
  }

  const original = [...rootPkg.workspaces];

  // Resolve workspace directories (supporting globs) while remembering the literal entries so formatting of the array stays intact.
  const dirs = [];

  for (const pattern of original) {
    const expanded = await expandPattern(root, pattern);

    if (expanded.length === 0) {
      console.warn(`warning: workspace "${pattern}" matched nothing, kept as-is`);
      dirs.push(pattern);
    } else {
      dirs.push(...expanded);
    }
  }

  const nameByDir = new Map();
  const depsByDir = new Map();

  for (const dir of new Set(dirs)) {
    let pkg;

    try {
      pkg = JSON.parse(await fs.readFile(path.join(root, dir, "package.json"), "utf8"));
    } catch {
      console.warn(`warning: cannot read ${dir}/package.json, kept as-is`);
      continue;
    }

    if (typeof pkg.name !== "string") {
      console.warn(`warning: ${dir}/package.json has no name, kept as-is`);
      continue;
    }

    nameByDir.set(dir, pkg.name);
    const depNames = new Set();

    for (const key of RUNTIME_DEP_KEYS) {
      const deps = pkg[key];

      if (typeof deps === "object" && deps !== null) {
        for (const name of Object.keys(deps)) {
          depNames.add(name);
        }
      }
    }

    depsByDir.set(dir, depNames);
  }

  const dirByName = new Map([...nameByDir].map(([dir, name]) => [name, dir]));

  // Build the graph: edge dep -> dependent.
  const indegree = new Map();
  const dependents = new Map();

  for (const dir of depsByDir.keys()) {
    indegree.set(dir, 0);
    dependents.set(dir, new Set());
  }

  for (const [dir, depNames] of depsByDir) {
    const internalDeps = new Set();

    for (const name of depNames) {
      const depDir = dirByName.get(name);

      if (depDir !== undefined && depDir !== dir) {
        internalDeps.add(depDir);
      }
    }

    indegree.set(dir, internalDeps.size);
    for (const depDir of internalDeps) {
      dependents.get(depDir).add(dir);
    }
  }

  // Kahn's algorithm with alphabetical tie-break for a stable result.
  const ready = [...indegree].filter(([, n]) => n === 0).map(([dir]) => dir);

  ready.sort(compareNames);
  const sorted = [];

  while (ready.length > 0) {
    const dir = ready.shift();

    sorted.push(dir);
    for (const dependent of dependents.get(dir)) {
      indegree.set(dependent, indegree.get(dependent) - 1);
      if (indegree.get(dependent) === 0) {
        ready.push(dependent);
        ready.sort(compareNames);
      }
    }
  }

  if (sorted.length !== depsByDir.size) {
    const remaining = [...indegree]
      .filter(([, n]) => n > 0)
      .map(([dir]) => `${dir} (${nameByDir.get(dir)})`)
      .toSorted();

    throw new Error(`Circular workspace dependency detected involving: ${remaining.join(", ")}`);
  }

  // Directories we could not read (missing package.json, etc.) keep their relative position: append any original entries not covered by the sort.
  const sortedSet = new Set(sorted);
  const passthrough = original.filter((dir) => !sortedSet.has(dir));
  const next = [...sorted, ...passthrough];

  // `original` holds literal patterns; `next` holds concrete dirs. When no globs are used they are the same domain and directly comparable.
  const changed = next.length !== original.length || next.some((dir, i) => dir !== original[i]);

  if (!changed) {
    console.log("workspaces already sorted topologically.");

    return;
  }

  if (check) {
    console.error("workspaces are not topologically sorted.");
    console.error(`expected: ${JSON.stringify(next)}`);
    process.exit(1);
  }

  rootPkg.workspaces = next;
  await fs.writeFile(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);
  console.log("sorted workspaces topologically.");
}

await main();
