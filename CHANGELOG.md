# Changelog

## @tai-kun/vp-lint-plugins@0.0.11

### 新機能

- comment-one-sentence-per-lineで単純なブロックコメントを1行化する ([fd07848](https://github.com/tai-kun/vp-lint-plugins/commit/fd07848abea1e509ac8db18c26cafaa28cd647be))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.10...@tai-kun/vp-lint-plugins@0.0.11

## @tai-kun/vp-lint-plugins@0.0.10

### 新機能

- catchの引数名にerrorやreasonの使用を禁止するcatch-param-nameを追加 ([b42a59b](https://github.com/tai-kun/vp-lint-plugins/commit/b42a59bafeb776da736ecd89e30774efbd4ef15b))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.9...@tai-kun/vp-lint-plugins@0.0.10

## @tai-kun/vp-lint-plugins@0.0.9

### 新機能

- member-orderingにpublic/protected/private順序を追加しexplicit-member-accessibilityを新設 ([7173601](https://github.com/tai-kun/vp-lint-plugins/commit/7173601368fcc29b0a81991ca1ee83403257ae57))

### ドキュメント

- フロントマターを修正 ([07896ef](https://github.com/tai-kun/vp-lint-plugins/commit/07896efd7370312ee5d51ac166e1ab79263353f7))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.8...@tai-kun/vp-lint-plugins@0.0.9

## @tai-kun/vp-lint-plugins@0.0.8

### バグ修正

- 位置情報のないコメントで全ルールがクラッシュする問題を修正 ([872a70f](https://github.com/tai-kun/vp-lint-plugins/commit/872a70f40245339ea7853bfeb20735bb23e588ba))
- 値が null のコメントで blank-line がクラッシュする問題を修正 ([807ff3d](https://github.com/tai-kun/vp-lint-plugins/commit/807ff3d05e0b5939dac55602a2d0d9f80ed96cd9))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.7...@tai-kun/vp-lint-plugins@0.0.8

## @tai-kun/vp-lint-plugins@0.0.7

### 新機能

- no-await-in-expect ルールを追加 ([d273de3](https://github.com/tai-kun/vp-lint-plugins/commit/d273de3182c12c33b2ac4622557083bf15b9dec9))

### バグ修正

- /_#**PURE**_/ をコメントルールの対象外にする ([53d5008](https://github.com/tai-kun/vp-lint-plugins/commit/53d5008c78e983fe36ca35a743036ecd885d90b3))
- 文末の定義を変更 ([2432d08](https://github.com/tai-kun/vp-lint-plugins/commit/2432d080c78baef89944f58cc0b593ac6011a108))

### ドキュメント

- フロントマターを修正 ([d630729](https://github.com/tai-kun/vp-lint-plugins/commit/d6307297e20ce592efb7225a5b9951810fcba438))

### テスト

- 見た目を改善 ([e9b2375](https://github.com/tai-kun/vp-lint-plugins/commit/e9b237502ef2b34de998109131eae287fcf837ba))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.6...@tai-kun/vp-lint-plugins@0.0.7

## @tai-kun/vp-lint-plugins@0.0.6

### 新機能

- object-properties-newline を JSON にも適用可能にする ([c77ab3c](https://github.com/tai-kun/vp-lint-plugins/commit/c77ab3cd7f5c528111ec6f20027e1105d09c8b64))

### バグ修正

- 文末として有効な文字を追加 ([6bda0ea](https://github.com/tai-kun/vp-lint-plugins/commit/6bda0ea763435529f4e7ae5706baeafebead596e))

### リファクタリング

- 内部利用のファイル名を変更 ([390b7d7](https://github.com/tai-kun/vp-lint-plugins/commit/390b7d7c6cbf261268b7d15dc3b51c24a3a57d7f))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.5...@tai-kun/vp-lint-plugins@0.0.6

## @tai-kun/vp-lint-plugins@0.0.5

### 新機能

- 空行ルールを blank-line に統合し JSDoc 上の空行を要求する ([564d33b](https://github.com/tai-kun/vp-lint-plugins/commit/564d33be060e52dc60715a975875f1b8d527a4b3))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.4...@tai-kun/vp-lint-plugins@0.0.5

## @tai-kun/vp-lint-plugins@0.0.4

### 新機能

- 同じモジュールを指す連続した import 宣言を 1 つにまとめるプラグインを追加 ([e56d0af](https://github.com/tai-kun/vp-lint-plugins/commit/e56d0af3700c36f8a9021280162dd3f4128af402))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.3...@tai-kun/vp-lint-plugins@0.0.4

## @tai-kun/vp-lint-plugins@0.0.3

### バグ修正

- sort-object-properties でグループ見出しコメントを保持する ([03e9e7d](https://github.com/tai-kun/vp-lint-plugins/commit/03e9e7d26caaa2f35ed82ba43c95645496a2810b))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.2...@tai-kun/vp-lint-plugins@0.0.3

## @tai-kun/vp-lint-plugins@0.0.2

### バグ修正

- 変数宣言後の空行ルールを関連する式文に対応させる ([fde33ce](https://github.com/tai-kun/vp-lint-plugins/commit/fde33cebf228feb0b20ab2177b034130f644f85c))

### その他

- js ファイルを型の lint の除外対象にする ([b08e0aa](https://github.com/tai-kun/vp-lint-plugins/commit/b08e0aa81784cdfeab7776fb54c5740d7633f948))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/compare/@tai-kun/vp-lint-plugins@0.0.1...@tai-kun/vp-lint-plugins@0.0.2

## @tai-kun/vp-lint-plugins@0.0.1

### 新機能

- 独自ルールを追加 ([a8c3039](https://github.com/tai-kun/vp-lint-plugins/commit/a8c30397bb4bfed814ca62b80b121cc1ac2374ec))
- Vite+ の lint プラグインを実装 ([8e4d753](https://github.com/tai-kun/vp-lint-plugins/commit/8e4d753ecd824e674f21ce49132508bbf79f89c8))

### ドキュメント

- 公開準備 ([52c90af](https://github.com/tai-kun/vp-lint-plugins/commit/52c90af892106c97767ae037342459065b7b30c8))
- tai-kun/blume-integrations v0.0.2 ([d5e53b2](https://github.com/tai-kun/vp-lint-plugins/commit/d5e53b2443c9752be83af31c818247f4cc8fd6f0))

### その他

- init ([3823030](https://github.com/tai-kun/vp-lint-plugins/commit/382303002bca355a0085d04a513dff0a94c19d70))

**Full Changelog**: https://github.com/tai-kun/vp-lint-plugins/commits/@tai-kun/vp-lint-plugins@0.0.1
