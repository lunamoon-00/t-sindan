# API 返り値確認ガイド

等身大で動ける仕事診断APIの返り値が設計通りかを確認するためのテスト手順です。

**前提**: `npm run dev` でローカル起動済み。ポートが 3001 の場合は `localhost:3000` を `localhost:3001` に置き換えてください。

---

## テストの実行順

1. **まず `/api/score` を3パターンでテスト**（パターンA → B → C）
2. **次に `/api/narrative` を1パターンでテスト**（scoreの返り値を流用）
3. **エラー時は切り分けセクションを参照**

---

## 1. POST /api/score のテスト

### パターンA: コツコツ入力・更新型（type_02）が出やすい回答

| Q01 | Q02 | Q03 | Q04 | Q05 | Q06 | Q07 | Q08 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| B   | B   | A   | B   | A   | A   | B   | A   |

#### ブラウザ Console での fetch 例

```javascript
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: { Q01: 'B', Q02: 'B', Q03: 'A', Q04: 'B', Q05: 'A', Q06: 'A', Q07: 'B', Q08: 'A' },
    schema_version: '1',
    diagnosis_version: '1',
  }),
}).then(r => r.json()).then(console.log).catch(console.error);
```

#### PowerShell での Invoke-RestMethod 例

```powershell
$body = @{
  answers = @{ Q01='B'; Q02='B'; Q03='A'; Q04='B'; Q05='A'; Q06='A'; Q07='B'; Q08='A' }
  schema_version = '1'
  diagnosis_version = '1'
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://localhost:3000/api/score' -Method Post -ContentType 'application/json' -Body $body
```

#### 期待される返り値の確認ポイント

| 項目 | 期待値 |
|------|--------|
| `ok` | `true` |
| `top_type_id` | `"type_02"` |
| `second_type_id` | `"type_01"` または `"type_03"` のいずれか |
| `confidence_level` | `"high"` |
| `reason_summary.top_reasons` | 配列、各要素に `reason_tag`, `label`, `weight` がある。最大3件 |
| `reason_summary.top_reasons[].label` | 生の `reason_tag` ではなくラベルが入っていること |
| `result_payload.result_core` | `top_type_id`, `second_type_id`, `confidence_level`, `raw_scores` がある |
| `result_payload.type_profile` | `type_id: "type_02"`, `label: "コツコツ入力・更新型"`, `search_keywords`, `exclude_keywords`, `first_step_hint` がある |
| `result_payload.reason_summary` | `top_reasons` がある |

---

### パターンB: 受信・案内型（type_01）が出やすい回答

| Q01 | Q02 | Q03 | Q04 | Q05 | Q06 | Q07 | Q08 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| A   | A   | B   | A   | B   | B   | A   | B   |

#### ブラウザ Console での fetch 例

```javascript
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: { Q01: 'A', Q02: 'A', Q03: 'B', Q04: 'A', Q05: 'B', Q06: 'B', Q07: 'A', Q08: 'B' },
    schema_version: '1',
    diagnosis_version: '1',
  }),
}).then(r => r.json()).then(console.log).catch(console.error);
```

#### PowerShell での Invoke-RestMethod 例

```powershell
$body = @{
  answers = @{ Q01='A'; Q02='A'; Q03='B'; Q04='A'; Q05='B'; Q06='B'; Q07='A'; Q08='B' }
  schema_version = '1'
  diagnosis_version = '1'
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://localhost:3000/api/score' -Method Post -ContentType 'application/json' -Body $body
```

#### 期待される返り値の確認ポイント

| 項目 | 期待値 |
|------|--------|
| `ok` | `true` |
| `top_type_id` | `"type_01"` |
| `second_type_id` | `"type_02"` または `"type_03"` のいずれか |
| `confidence_level` | `"high"` |
| `reason_summary.top_reasons` | 配列、各要素に `reason_tag`, `label`, `weight` がある |
| `result_payload.type_profile` | `type_id: "type_01"`, `label: "受信・案内型"` |
| `result_payload.type_profile.search_keywords` | `["受付", "窓口", "コールセンター", ...]` |
| `result_payload.type_profile.first_step_hint` | 文言あり |

---

### パターンC: 手順事務・調整対応型（type_03）が出やすい回答

| Q01 | Q02 | Q03 | Q04 | Q05 | Q06 | Q07 | Q08 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| C   | C   | C   | C   | C   | C   | C   | C   |

#### ブラウザ Console での fetch 例

```javascript
fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: { Q01: 'C', Q02: 'C', Q03: 'C', Q04: 'C', Q05: 'C', Q06: 'C', Q07: 'C', Q08: 'C' },
    schema_version: '1',
    diagnosis_version: '1',
  }),
}).then(r => r.json()).then(console.log).catch(console.error);
```

#### PowerShell での Invoke-RestMethod 例

```powershell
$body = @{
  answers = @{ Q01='C'; Q02='C'; Q03='C'; Q04='C'; Q05='C'; Q06='C'; Q07='C'; Q08='C' }
  schema_version = '1'
  diagnosis_version = '1'
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri 'http://localhost:3000/api/score' -Method Post -ContentType 'application/json' -Body $body
```

#### 期待される返り値の確認ポイント

| 項目 | 期待値 |
|------|--------|
| `ok` | `true` |
| `top_type_id` | `"type_03"` |
| `second_type_id` | `"type_01"` または `"type_02"` のいずれか |
| `confidence_level` | `"high"` |
| `reason_summary.top_reasons` | 配列、「prefer_adjustment」「prefer_structure」等のラベルが含まれる想定 |
| `result_payload.type_profile` | `type_id: "type_03"`, `label: "手順事務・調整対応型"` |
| `result_payload.type_profile.first_step_hint` | 「事務」「調整」を含む文言 |

---

## 2. POST /api/narrative のテスト

`/api/score` の返り値から `result_core`, `type_profile`, `reason_summary` を取り、`generation_rules: { template_only: true }` を付けてPOSTする。

### ブラウザ Console での fetch 例

```javascript
// 1. score を取得
const scoreRes = await fetch('/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: { Q01: 'A', Q02: 'A', Q03: 'B', Q04: 'A', Q05: 'B', Q06: 'B', Q07: 'A', Q08: 'B' },
    schema_version: '1',
    diagnosis_version: '1',
  }),
});
const scoreData = await scoreRes.json();
if (!scoreData.ok) throw new Error(scoreData.error);

// 2. narrative に投げる（score の result_payload を流用）
const narrativeBody = {
  result_core: scoreData.result_payload.result_core,
  type_profile: scoreData.result_payload.type_profile,
  reason_summary: scoreData.result_payload.reason_summary,
  generation_rules: { template_only: true },
};
const narrativeRes = await fetch('/api/narrative', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(narrativeBody),
});
const narrativeData = await narrativeRes.json();
console.log(narrativeData);
```

### PowerShell での Invoke-RestMethod 例（最小構成・固定値）

```powershell
$narrativeBody = @{
  result_core = @{
    top_type_id = 'type_01'
    second_type_id = 'type_02'
    confidence_level = 'high'
    raw_scores = @{ type_01 = 16; type_02 = 2; type_03 = 5 }
  }
  type_profile = @{
    type_id = 'type_01'
    label = '受信・案内型'
    description = '電話やメールの受付、窓口案内など、受動的な対応が中心の仕事です。'
    search_keywords = @('受付', '窓口', 'コールセンター')
    exclude_keywords = @('営業', '開発', '設計')
    first_step_hint = 'まずは「受付」「窓口」などの求人を検索してみましょう。'
  }
  reason_summary = @{
    top_reasons = @(
      @{ reason_tag = 'prefer_reception'; label = '受付や案内の業務が合う傾向があります'; weight = 4 }
    )
  }
  generation_rules = @{ template_only = $true }
} | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri 'http://localhost:3000/api/narrative' -Method Post -ContentType 'application/json' -Body $narrativeBody
```

### 返り値で確認すべき項目

| 項目 | 説明 |
|------|------|
| `ok` | `true` であること |
| `summary_comment` | 型の説明を含む文章。`type_profile.label` と `confidence_level` に応じた文言 |
| `reason_bullets` | 文字列配列。`reason_summary.top_reasons` の `label` が最大3件 |
| `caution_bullets` | 文字列配列。negative寄りタグがある場合のみ最大1件、なければ空配列 |
| `next_step_comment` | `今週の一歩:` で始まり、`type_profile.first_step_hint` を含む |

※ narrative 側では採点ロジックは再計算せず、受け取った `result_core` / `type_profile` / `reason_summary` をそのままテンプレートに流し込むだけです。

---

## 3. エラー時の切り分け

### 400 Bad Request

| よくある原因 | 確認場所 |
|--------------|----------|
| `answers` が空 | `answers` に Q01〜Q08 のいずれかが1件以上あるか |
| `answers` の値が A/B/C 以外 | 各回答が `"A"`, `"B"`, `"C"` のいずれかか（小文字や数値は不可） |
| `schema_version` / `diagnosis_version` 欠落 | 必須フィールドが存在するか |
| 無効な JSON | 入力JSONの括弧・カンマ・引用符が正しいか |
| narrative: `template_only` が false | `generation_rules.template_only` が `true` か |
| narrative: 型が不足 | `result_core`, `type_profile`, `reason_summary`, `generation_rules` が全てあるか |

**Zod バリデーションエラー**の場合は、レスポンスの `error` に具体的なメッセージが入ります。

---

### 405 Method Not Allowed

| よくある原因 | 確認場所 |
|--------------|----------|
| GET で呼んでいる | 両APIとも **POST** のみ対応。メソッドを POST に変更 |
| パス typo | `/api/score` または `/api/narrative` を正しく指定しているか |

---

### 500 Internal Server Error

| よくある原因 | 確認場所 |
|--------------|----------|
| サーバー内部の例外 | ターミナル（`npm run dev` を実行している画面）のログ |
| ルール定義の不整合 | `lib/rules.ts` の `SCORING_RULES`, `TYPE_PROFILES`, `REASON_LABELS` |
| 型の不一致 | `lib/types.ts` とレスポンス構築ロジックの整合 |

500 のときは、レスポンスの `error` に「サーバーエラーが発生しました」または narrative 失敗時のメッセージが入ります。呼び出し側は score の結果だけで表示継続できるように設計されています。

---

### 簡易チェックリスト

1. **URL**: `http://localhost:3000/api/score` または `/api/narrative` で、ポートは 3000 か
2. **メソッド**: POST
3. **Content-Type**: `application/json`
4. **ボディ**: 有効な JSON
5. **score**: `answers` に Q01〜Q08 のキーで A/B/C のいずれかが1件以上
6. **narrative**: `result_core`, `type_profile`, `reason_summary`, `generation_rules: { template_only: true }` を全て含む
