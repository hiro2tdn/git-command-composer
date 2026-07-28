# Git Command Composer

やりたい操作を選び、オプション付きで Git コマンドを組み立てる開発者向けリファレンスです。

## コンセプト

**操作を選ぶ → オプションを調整 → コマンドが完成**

- カテゴリ: 新規・セットアップ / ワークツリー / コミット / ブランチ / リモート / 履歴調査 / 修復
- 各操作に `--staged`, `--force-with-lease`, `--rebase` などのオプションを UI で選択
- オプションごとに説明文を表示。選択中のオプション解説も一覧表示
- コマンドはリアルタイムで組み立て、ワンクリックでコピー

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000

## GitHub Pages

Settings → Pages → Source: **GitHub Actions**

`main` へ push すると `.github/workflows/deploy.yml` が自動デプロイします。

## データの追加・編集

`lib/goals.ts` に操作・オプション・説明を定義しています。

```typescript
{
  id: "diff",
  command: {
    base: "git diff",
    toggles: [
      { id: "staged", flag: "--staged", label: "...", description: "..." },
    ],
    texts: [
      { id: "target", placeholder: "path/to/file", suffix: true, ... },
    ],
  },
}
```
