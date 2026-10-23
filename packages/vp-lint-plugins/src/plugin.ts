import { definePlugin } from "vite-plus/lint/plugins";

import blankLineAfterControlBlock from "./rules/blank-line-after-control-block.js";
import blankLineAfterDeclaration from "./rules/blank-line-after-declaration.js";
import blankLineAfterVariableDeclaration from "./rules/blank-line-after-variable-declaration.js";
import blankLineBeforeReturn from "./rules/blank-line-before-return.js";
import blankLineBetweenClassMembers from "./rules/blank-line-between-class-members.js";
import blankLineBetweenSwitchCases from "./rules/blank-line-between-switch-cases.js";
import commentJapaneseSpacing from "./rules/comment-japanese-spacing.js";
import commentOneSentencePerLine from "./rules/comment-one-sentence-per-line.js";
import jsdocParamOrder from "./rules/jsdoc-param-order.js";
import jsdocTagLines from "./rules/jsdoc-tag-lines.js";
import jsdocTagOrder from "./rules/jsdoc-tag-order.js";
import memberOrdering from "./rules/member-ordering.js";
import objectPropertiesNewline from "./rules/object-properties-newline.js";
import overloadSignaturesAdjacent from "./rules/overload-signatures-adjacent.js";
import sortImportExportSpecifiers from "./rules/sort-import-export-specifiers.js";
import sortJsxProps from "./rules/sort-jsx-props.js";
import sortObjectProperties from "./rules/sort-object-properties.js";
import sortTypeMembers from "./rules/sort-type-members.js";
import spacedComment from "./rules/spaced-comment.js";
import typeLiteralPropertiesNewline from "./rules/type-literal-properties-newline.js";

export default definePlugin({
  meta: { name: "tai-kun" },
  rules: {
    "sort-jsx-props": sortJsxProps,
    "spaced-comment": spacedComment,
    "jsdoc-tag-lines": jsdocTagLines,
    "jsdoc-tag-order": jsdocTagOrder,
    "member-ordering": memberOrdering,
    "jsdoc-param-order": jsdocParamOrder,
    "sort-type-members": sortTypeMembers,
    "sort-object-properties": sortObjectProperties,
    "blank-line-before-return": blankLineBeforeReturn,
    "comment-japanese-spacing": commentJapaneseSpacing,
    "object-properties-newline": objectPropertiesNewline,
    "blank-line-after-declaration": blankLineAfterDeclaration,
    "overload-signatures-adjacent": overloadSignaturesAdjacent,
    "comment-one-sentence-per-line": commentOneSentencePerLine,
    "sort-import-export-specifiers": sortImportExportSpecifiers,
    "blank-line-after-control-block": blankLineAfterControlBlock,
    "blank-line-between-switch-cases": blankLineBetweenSwitchCases,
    "type-literal-properties-newline": typeLiteralPropertiesNewline,
    "blank-line-between-class-members": blankLineBetweenClassMembers,
    "blank-line-after-variable-declaration": blankLineAfterVariableDeclaration,
  },
});
