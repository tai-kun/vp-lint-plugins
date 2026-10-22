import { definePlugin } from "vite-plus/lint/plugins";

import blankLineAfterControlBlock from "./oxlint-plugins/blank-line-after-control-block.js";
import blankLineAfterDeclaration from "./oxlint-plugins/blank-line-after-declaration.js";
import blankLineBeforeReturn from "./oxlint-plugins/blank-line-before-return.js";
import commentOneSentencePerLine from "./oxlint-plugins/comment-one-sentence-per-line.js";
import objectPropertiesNewline from "./oxlint-plugins/object-properties-newline.js";
import sortImportExportSpecifiers from "./oxlint-plugins/sort-import-export-specifiers.js";
import sortJsxProps from "./oxlint-plugins/sort-jsx-props.js";
import sortObjectProperties from "./oxlint-plugins/sort-object-properties.js";
import typeLiteralPropertiesNewline from "./oxlint-plugins/type-literal-properties-newline.js";

export default definePlugin({
  meta: { name: "project" },
  rules: {
    "sort-jsx-props": sortJsxProps,
    "sort-object-properties": sortObjectProperties,
    "blank-line-before-return": blankLineBeforeReturn,
    "object-properties-newline": objectPropertiesNewline,
    "blank-line-after-declaration": blankLineAfterDeclaration,
    "comment-one-sentence-per-line": commentOneSentencePerLine,
    "sort-import-export-specifiers": sortImportExportSpecifiers,
    "blank-line-after-control-block": blankLineAfterControlBlock,
    "type-literal-properties-newline": typeLiteralPropertiesNewline,
  },
});
