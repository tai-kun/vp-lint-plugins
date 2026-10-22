// `Array.isArray` の型絞り込み機能を強化します。
// @ts-expect-error: 組み込みの ArrayConstructor の定義と互換性がないため。
// oxlint-disable
declare module globalThis {
  interface ArrayConstructor {
    isArray(arg: readonly any[] | any): arg is readonly any[];
  }
}
