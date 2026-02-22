# 等身大で動ける仕事診断 API（MVP）

Next.js App Router + TypeScript による診断APIのMVP実装です。

## フォルダ構成

```
t-sindan/
├── app/
│   ├── api/
│   │   ├── score/
│   │   │   └── route.ts      # POST /api/score - ルールベース採点
│   │   └── narrative/
│   │       └── route.ts      # POST /api/narrative - 判定済みデータの文章化
│   └── layout.tsx
├── lib/
│   ├── types.ts              # 型定義
│   ├── schemas.ts            # Zod バリデーション
│   ├── rules.ts              # 採点ルール・マスタ（type_01〜03, Q01〜Q08）
│   ├── score.ts              # 採点ロジック（pure functions）
│   ├── narrative.ts          # ナラティブ生成（template_only）
│   └── api-utils.ts          # エラーレスポンス等
├── package.json
├── tsconfig.json
├── next.config.js
├── TEST.md                   # テスト手順・curl例
└── README.md
```

## 設計方針

- **/api/score**: ルールベース判定のみ（AI不使用）
- **/api/narrative**: 判定済みデータの文章化のみ（再判定しない）
- narrative 失敗時も UI は score 結果だけで表示継続可能
- 真実データ（score）と表示データ（narrative）は分離して保存可能

## 使い方

```bash
npm install
npm run dev
```

テスト手順・curl例は [TEST.md](./TEST.md) を参照してください。
