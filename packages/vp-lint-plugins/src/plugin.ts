import { definePlugin } from "vite-plus/lint/plugins";

import blankLineAfterControlBlock from "./rules/blank-line-after-control-block.js";
import blankLineAfterDeclaration from "./rules/blank-line-after-declaration.js";
import blankLineBeforeReturn from "./rules/blank-line-before-return.js";
import commentOneSentencePerLine from "./rules/comment-one-sentence-per-line.js";
import objectPropertiesNewline from "./rules/object-properties-newline.js";
import sortImportExportSpecifiers from "./rules/sort-import-export-specifiers.js";
import sortJsxProps from "./rules/sort-jsx-props.js";
import sortObjectProperties from "./rules/sort-object-properties.js";
import typeLiteralPropertiesNewline from "./rules/type-literal-properties-newline.js";

export default definePlugin({
  meta: { name: "tai-kun" },
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
