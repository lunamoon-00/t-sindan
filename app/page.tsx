export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>等身大で動ける仕事診断 API</h1>
      <p>診断APIが起動しています。</p>
      <h2>エンドポイント</h2>
      <ul>
        <li><code>POST /api/score</code> … 採点API</li>
        <li><code>POST /api/narrative</code> … ナラティブ生成API</li>
      </ul>
      <p>
        テスト方法は <code>TEST.md</code> を参照してください。
        ブラウザの開発者ツール（F12）→ コンソールで fetch を実行するか、
        curl / PowerShell から POST リクエストを送ってください。
      </p>
    </main>
  )
}
