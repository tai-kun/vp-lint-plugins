import { definePlugin } from "vite-plus/lint/plugins";

import blankLine from "./rules/blank-line.js";
import commentJapaneseSpacing from "./rules/comment-japanese-spacing.js";
import commentOneSentencePerLine from "./rules/comment-one-sentence-per-line.js";
import jsdocParamOrder from "./rules/jsdoc-param-order.js";
import jsdocTagLines from "./rules/jsdoc-tag-lines.js";
import jsdocTagOrder from "./rules/jsdoc-tag-order.js";
import memberOrdering from "./rules/member-ordering.js";
import mergeImports from "./rules/merge-imports.js";
import noAwaitInExpect from "./rules/no-await-in-expect.js";
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
    "blank-line": blankLine,
    "merge-imports": mergeImports,
    "sort-jsx-props": sortJsxProps,
    "spaced-comment": spacedComment,
    "jsdoc-tag-lines": jsdocTagLines,
    "jsdoc-tag-order": jsdocTagOrder,
    "member-ordering": memberOrdering,
    "jsdoc-param-order": jsdocParamOrder,
    "sort-type-members": sortTypeMembers,
    "no-await-in-expect": noAwaitInExpect,
    "sort-object-properties": sortObjectProperties,
    "comment-japanese-spacing": commentJapaneseSpacing,
    "object-properties-newline": objectPropertiesNewline,
    "overload-signatures-adjacent": overloadSignaturesAdjacent,
    "comment-one-sentence-per-line": commentOneSentencePerLine,
    "sort-import-export-specifiers": sortImportExportSpecifiers,
    "type-literal-properties-newline": typeLiteralPropertiesNewline,
  },
});
