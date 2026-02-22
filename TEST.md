# ローカルでのテスト手順

## 1. 起動

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動します。

---

## 2. /api/score のテスト

### curl 例

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d "{\"answers\":{\"Q01\":\"A\",\"Q02\":\"A\",\"Q03\":\"A\",\"Q04\":\"A\",\"Q05\":\"A\",\"Q06\":\"A\",\"Q07\":\"A\",\"Q08\":\"A\"},\"schema_version\":\"1\",\"diagnosis_version\":\"1\"}"
```

### fetch 例（ブラウザコンソール）

```javascript
fetch('http://localhost:3000/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: {
      Q01: 'A', Q02: 'A', Q03: 'A', Q04: 'A',
      Q05: 'A', Q06: 'A', Q07: 'A', Q08: 'A',
    },
    schema_version: '1',
    diagnosis_version: '1',
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

### 期待レスポンス例（成功時）

```json
{
  "ok": true,
  "top_type_id": "type_01",
  "second_type_id": "type_03",
  "confidence_level": "high",
  "reason_summary": {
    "top_reasons": [
      { "reason_tag": "prefer_reception", "label": "受付や案内の業務が合う傾向があります", "weight": 3 }
    ],
    "caution_tag": null
  },
  "result_payload": {
    "result_core": {
      "top_type_id": "type_01",
      "second_type_id": "type_03",
      "confidence_level": "high",
      "raw_scores": { "type_01": 12, "type_02": 2, "type_03": 8 }
    },
    "type_profile": {
      "type_id": "type_01",
      "label": "受信・案内型",
      "description": "...",
      "search_keywords": ["受付", "窓口", ...],
      "exclude_keywords": ["営業", "開発", "設計"],
      "first_step_hint": "まずは「受付」「窓口」などの求人を検索してみましょう。"
    },
    "reason_summary": { ... }
  }
}
```

---

## 3. /api/narrative のテスト

まず `/api/score` の結果の `result_payload` から必要な項目を渡します。

### curl 例（score の result_payload をそのまま流用）

```bash
curl -X POST http://localhost:3000/api/narrative \
  -H "Content-Type: application/json" \
  -d "{
    \"result_core\": {
      \"top_type_id\": \"type_01\",
      \"second_type_id\": \"type_03\",
      \"confidence_level\": \"high\",
      \"raw_scores\": { \"type_01\": 12, \"type_02\": 2, \"type_03\": 8 }
    },
    \"type_profile\": {
      \"type_id\": \"type_01\",
      \"label\": \"受信・案内型\",
      \"description\": \"電話やメールの受付、窓口案内など、受動的な対応が中心の仕事です。\",
      \"search_keywords\": [\"受付\", \"窓口\", \"コールセンター\"],
      \"exclude_keywords\": [\"営業\", \"開発\", \"設計\"],
      \"first_step_hint\": \"まずは「受付」「窓口」などの求人を検索してみましょう。\"
    },
    \"reason_summary\": {
      \"top_reasons\": [
        { \"reason_tag\": \"prefer_reception\", \"label\": \"受付や案内の業務が合う傾向があります\", \"weight\": 3 }
      ]
    },
    \"generation_rules\": { \"template_only\": true }
  }"
```

### fetch 例（score 取得後に narrative を呼ぶフロー）

```javascript
// 1. score を取得
const scoreRes = await fetch('http://localhost:3000/api/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: { Q01: 'A', Q02: 'A', Q03: 'A', Q04: 'A', Q05: 'A', Q06: 'A', Q07: 'A', Q08: 'A' },
    schema_version: '1',
    diagnosis_version: '1',
  }),
});
const scoreData = await scoreRes.json();

if (!scoreData.ok) {
  console.error(scoreData);
  throw new Error(scoreData.error);
}

// 2. 結果を表示（score だけでも成立）
console.log('型:', scoreData.result_payload.type_profile.label);
console.log('信頼度:', scoreData.confidence_level);

// 3. 任意で narrative を取得して文章部分を差し替え
try {
  const narrativeRes = await fetch('http://localhost:3000/api/narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      result_core: scoreData.result_payload.result_core,
      type_profile: scoreData.result_payload.type_profile,
      reason_summary: scoreData.result_payload.reason_summary,
      generation_rules: { template_only: true },
    }),
  });
  const narrativeData = await narrativeRes.json();
  if (narrativeData.ok) {
    console.log('サマリー:', narrativeData.summary_comment);
    console.log('理由:', narrativeData.reason_bullets);
    console.log('注意:', narrativeData.caution_bullets);
    console.log('今週の一歩:', narrativeData.next_step_comment);
  }
} catch (e) {
  // narrative 失敗時も score 結果で表示継続
  console.warn('narrative 取得失敗、score 結果のみで表示継続', e);
}
```

### 期待レスポンス例（成功時）

```json
{
  "ok": true,
  "summary_comment": "受信・案内型が当てはまる傾向が比較的強い可能性があります。電話やメールの受付、窓口案内など、受動的な対応が中心の仕事です。",
  "reason_bullets": ["受付や案内の業務が合う傾向があります"],
  "caution_bullets": [],
  "next_step_comment": "今週の一歩: まずは「受付」「窓口」などの求人を検索してみましょう。"
}
```

---

## 4. エラーケースの確認

### バリデーションエラー（400）

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d "{\"answers\":{},\"schema_version\":\"1\",\"diagnosis_version\":\"1\"}"
```

期待: `{"ok":false,"error":"有効な回答が1件以上必要です","code":"INVALID_ANSWERS"}`

### narrative の template_only 必須

```bash
curl -X POST http://localhost:3000/api/narrative \
  -H "Content-Type: application/json" \
  -d "{\"result_core\":{...},\"type_profile\":{...},\"reason_summary\":{...},\"generation_rules\":{\"template_only\":false}}"
```

期待: `{"ok":false,"error":"現在は template_only のみ対応しています","code":"UNSUPPORTED_MODE"}`
