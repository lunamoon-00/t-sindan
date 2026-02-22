# GAS と Next.js API の接続手順

Googleフォームの回答を Next.js API に送るまでの流れです。

---

## ステップ1: Next.js API をデプロイする

GAS から呼べるように、API をインターネット上に公開します。

### 1-1. Vercel にデプロイ（無料）

1. [Vercel](https://vercel.com) にアクセスし、GitHub でログイン
2. 「Add New」→「Project」を選択
3. このプロジェクト（t-sindan）を GitHub にプッシュしてから、Vercel でそのリポジトリを選択
4. デプロイを実行
5. 完了後、`https://xxxx.vercel.app` のような URL が表示されます → **これをメモ**

### 1-2. GitHub にまだプッシュしていない場合

```powershell
cd C:\Users\PC_User\Desktop\t-sindan
git init
git add .
git commit -m "Initial commit"
```

その後、GitHub で新規リポジトリを作成し、以下でプッシュ：

```powershell
git remote add origin https://github.com/あなたのユーザー名/t-sindan.git
git push -u origin main
```

---

## ステップ2: GAS のプロジェクトを開く

1. [Google Apps Script](https://script.google.com) を開く
2. フォームと連携している既存プロジェクトを開くか、新規作成
3. フォームの「回答」を処理するスクリプトがある場所に、次のコードを追加

---

## ステップ3: GAS に API 呼び出しコードを追加する

### 3-1. 定数（一番上に書く）

```javascript
// ★★★ ここを Vercel の URL に書き換える ★★★
var API_BASE_URL = 'https://xxxx.vercel.app';
```

### 3-2. 採点 API を呼ぶ関数

```javascript
/**
 * Next.js の /api/score を呼び出す
 * @param {Object} answers - { Q01: 'A', Q02: 'B', ... } の形式
 * @returns {Object} API の返り値（JSON）
 */
function callScoreApi(answers) {
  var url = API_BASE_URL + '/api/score';
  var payload = JSON.stringify({
    answers: answers,
    schema_version: '1',
    diagnosis_version: '1',
  });
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true,
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return json;
}
```

### 3-3. ナラティブ API を呼ぶ関数

```javascript
/**
 * Next.js の /api/narrative を呼び出す
 * @param {Object} resultPayload - /api/score の返り値の result_payload
 * @returns {Object} API の返り値（JSON）
 */
function callNarrativeApi(resultPayload) {
  var url = API_BASE_URL + '/api/narrative';
  var payload = JSON.stringify({
    result_core: resultPayload.result_core,
    type_profile: resultPayload.type_profile,
    reason_summary: resultPayload.reason_summary,
    generation_rules: { template_only: true },
  });
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true,
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return json;
}
```

### 3-4. フォームの回答を API 形式に変換する

Googleフォームの質問と回答の対応は、フォームの構成によります。例として「1行目の回答がQ01、2行目がQ02…」の場合：

```javascript
/**
 * フォーム回答（e.values など）を API 用の answers に変換
 * ※ フォームの設問順・選択肢に合わせて編集してください
 * @param {Array} formValues - フォームの values 配列
 * @returns {Object} { Q01: 'A', Q02: 'B', ... }
 */
function formValuesToAnswers(formValues) {
  // 例: 1列目はタイムスタンプなのでスキップ、2〜9列目が Q01〜Q08
  // 選択肢 '選択肢A' → 'A', '選択肢B' → 'B', '選択肢C' → 'C' に変換
  var answers = {};
  var questionIds = ['Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08'];
  
  for (var i = 0; i < 8; i++) {
    var val = (formValues[i + 1] || '').toString(); // 列の開始位置は要調整
    if (val.indexOf('A') >= 0 || val === 'A') answers[questionIds[i]] = 'A';
    else if (val.indexOf('B') >= 0 || val === 'B') answers[questionIds[i]] = 'B';
    else if (val.indexOf('C') >= 0 || val === 'C') answers[questionIds[i]] = 'C';
  }
  return answers;
}
```

---

## ステップ4: フォーム送信時に API を呼ぶ

フォーム送信トリガーで呼ばれる関数の例です。

```javascript
function onFormSubmit(e) {
  // フォームの回答を取得（e.values は [タイムスタンプ, Q1の回答, Q2の回答, ...]）
  var formValues = e.values;
  
  // API 用の answers に変換
  var answers = formValuesToAnswers(formValues);
  
  // 採点 API を呼ぶ
  var scoreResult = callScoreApi(answers);
  
  if (!scoreResult.ok) {
    Logger.log('採点APIエラー: ' + scoreResult.error);
    return;
  }
  
  // 結果をスプレッドシートに書き込む、メール送信など
  var typeLabel = scoreResult.result_payload.type_profile.label;
  Logger.log('診断結果: ' + typeLabel);
  
  // 任意: ナラティブも取得
  var narrativeResult = callNarrativeApi(scoreResult.result_payload);
  if (narrativeResult.ok) {
    Logger.log('サマリー: ' + narrativeResult.summary_comment);
    Logger.log('今週の一歩: ' + narrativeResult.next_step_comment);
  }
}
```

フォーム送信時に実行されるよう、トリガーを設定してください。  
（編集画面 → 左の時計アイコン「トリガー」→ トリガーを追加 → イベント「フォーム送信時」）

---

## チェックリスト

- [ ] Vercel にデプロイして URL を取得した
- [ ] GAS の `API_BASE_URL` をその URL に書き換えた
- [ ] `formValuesToAnswers` をフォームの設問順・選択肢に合わせて編集した
- [ ] フォーム送信トリガーで `onFormSubmit` を指定した

---

## 困ったとき

- **404 が出る**: URL が間違っていないか確認。`https://xxxx.vercel.app/api/score` に POST しているか
- **CORS エラー**: GAS の `UrlFetchApp` はサーバー側なので CORS の影響は受けない
- **認証エラー**: 現在の API は認証不要。将来セキュリティを入れる場合は別途対応
