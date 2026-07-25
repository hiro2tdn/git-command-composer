export type CategoryId =
  | "setup"
  | "workspace"
  | "commit"
  | "branch"
  | "remote"
  | "history"
  | "recovery";

export type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  description: string;
};

export type ToggleOption = {
  id: string;
  flag: string;
  label: string;
  description: string;
  defaultSelected?: boolean;
  /** 同じ group の toggle は排他 */
  group?: string;
  danger?: boolean;
  /** この toggle が ON のときだけ表示・適用 */
  requiresToggle?: string;
  /** 指定 radio が選択されているときだけ表示・適用 */
  requiresRadio?: { group: string; id: string };
};

export type RadioOption = {
  id: string;
  flag: string;
  label: string;
  description: string;
  group: string;
  defaultSelected?: boolean;
  danger?: boolean;
};

export type TextOption = {
  id: string;
  flag?: string;
  placeholder: string;
  label: string;
  description: string;
  defaultValue?: string;
  suffix?: boolean;
  /** この toggle が ON のときだけ表示・適用 */
  requiresToggle?: string;
  /** いずれかの toggle が ON なら適用しない */
  excludeWhenToggles?: string[];
  /** 指定 radio が選択されているときだけ表示・適用 */
  requiresRadio?: { group: string; id: string };
  /** 指定 radio が選択されているときは非表示 */
  excludeWhenRadio?: { group: string; id: string };
};

export type CommandConfig = {
  base: string;
  toggles?: ToggleOption[];
  radios?: RadioOption[];
  texts?: TextOption[];
};

export type RelatedCommand = {
  label: string;
  command: string;
  note?: string;
};

export type Goal = {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  emoji: string;
  command: CommandConfig;
  related?: RelatedCommand[];
  tip?: string;
  warning?: string;
};

export const categories: Category[] = [
  {
    id: "setup",
    label: "新規・セットアップ",
    emoji: "🚀",
    description: "init / clone / remote 設定",
  },
  {
    id: "workspace",
    label: "ワークツリー",
    emoji: "📂",
    description: "変更の確認・ステージング",
  },
  {
    id: "commit",
    label: "コミット",
    emoji: "📝",
    description: "記録・修正",
  },
  {
    id: "branch",
    label: "ブランチ",
    emoji: "🌿",
    description: "分岐・統合・リベース",
  },
  {
    id: "remote",
    label: "リモート",
    emoji: "☁️",
    description: "push / pull / fetch",
  },
  {
    id: "history",
    label: "履歴調査",
    emoji: "🔎",
    description: "log / show / blame",
  },
  {
    id: "recovery",
    label: "修復",
    emoji: "🛠️",
    description: "restore / reset / revert / stash",
  },
];

export const goals: Goal[] = [
  // --- setup ---
  {
    id: "init",
    category: "setup",
    title: "新しいリポジトリを初期化する",
    description: "空のディレクトリを Git 管理下に置く",
    emoji: "📁",
    command: {
      base: "git init",
      toggles: [
        {
          id: "bare",
          flag: "--bare",
          label: "bare",
          description: "作業ツリーなしの bare リポジトリ（サーバー用途）",
        },
        {
          id: "quiet",
          flag: "-q",
          label: "quiet",
          description: "出力を抑制",
        },
      ],
      texts: [
        {
          id: "initial-branch",
          flag: "--initial-branch",
          placeholder: "main",
          label: "初期ブランチ名",
          description: "最初のブランチ名を指定（デフォルトは master/main）",
        },
        {
          id: "path",
          placeholder: ".",
          label: "ディレクトリ",
          description: "初期化するパス（省略時はカレント）",
          suffix: true,
        },
      ],
    },
    related: [
      {
        label: "GitHub と接続",
        command: "git remote add origin https://github.com/user/repo.git",
      },
      {
        label: "初回 push",
        command: "git push -u origin main",
      },
    ],
  },
  {
    id: "clone",
    category: "setup",
    title: "リポジトリをクローンする",
    description: "リモートリポジトリをローカルに複製する",
    emoji: "📥",
    command: {
      base: "git clone",
      toggles: [
        {
          id: "recurse-submodules",
          flag: "--recurse-submodules",
          label: "submodules 込み",
          description: "サブモジュールも一緒に取得",
        },
        {
          id: "single-branch",
          flag: "--single-branch",
          label: "single-branch",
          description: "指定ブランチの履歴だけ取得（浅いクローン向け）",
        },
        {
          id: "quiet",
          flag: "-q",
          label: "quiet",
          description: "進捗出力を抑制",
        },
      ],
      texts: [
        {
          id: "depth",
          flag: "--depth",
          placeholder: "1",
          label: "shallow depth",
          description: "直近 N コミットだけ取得（浅いクローン）",
        },
        {
          id: "branch",
          flag: "-b",
          placeholder: "main",
          label: "ブランチ指定",
          description: "チェックアウトするブランチを指定",
        },
        {
          id: "url",
          placeholder: "https://github.com/user/repo.git",
          label: "リポジトリ URL",
          description: "HTTPS または SSH の URL",
          suffix: true,
        },
        {
          id: "directory",
          placeholder: "repo",
          label: "配置ディレクトリ名",
          description: "省略時はリポジトリ名がフォルダ名になる",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "remote-add",
    category: "setup",
    title: "リモートリポジトリを登録する",
    description: "GitHub 等の URL を origin として追加",
    emoji: "🔗",
    command: {
      base: "git remote add",
      texts: [
        {
          id: "name",
          placeholder: "origin",
          label: "リモート名",
          description: "通常は origin。複数リモート時は upstream 等",
          defaultValue: "origin",
          suffix: true,
        },
        {
          id: "url",
          placeholder: "https://github.com/user/repo.git",
          label: "URL",
          description: "HTTPS または git@github.com:user/repo.git",
          suffix: true,
        },
      ],
    },
    related: [
      { label: "登録済みリモート確認", command: "git remote -v" },
      { label: "URL 変更", command: "git remote set-url origin https://github.com/user/repo.git" },
    ],
  },

  // --- workspace ---
  {
    id: "status",
    category: "workspace",
    title: "作業ツリーの状態を確認する",
    description: "未ステージ・ステージ済み・未追跡ファイルを把握する",
    emoji: "📊",
    command: {
      base: "git status",
      toggles: [
        {
          id: "short",
          flag: "-s",
          label: "短い形式",
          description: "1行1ファイルのコンパクト表示。スクリプト連携にも向く",
        },
        {
          id: "branch",
          flag: "-b",
          label: "ブランチ情報",
          description: "短い形式に加え、現在ブランチ名も表示",
        },
        {
          id: "porcelain",
          flag: "--porcelain",
          label: "porcelain",
          description: "機械可読な固定フォーマット。CI やエディタ連携向け",
        },
        {
          id: "ignored",
          flag: "--ignored",
          label: "ignored も表示",
          description: ".gitignore 対象ファイルも一覧に含める",
        },
      ],
    },
    related: [
      {
        label: "変更ファイル名だけ欲しい",
        command: "git diff --name-only",
      },
    ],
  },
  {
    id: "diff",
    category: "workspace",
    title: "差分を精査する",
    description: "未ステージ / ステージ済み / 任意コミット間の diff を見る",
    emoji: "🔍",
    command: {
      base: "git diff",
      toggles: [
        {
          id: "staged",
          flag: "--staged",
          label: "ステージ済み",
          description: "次のコミットに入る変更だけ表示（`--cached` と同義）",
        },
        {
          id: "stat",
          flag: "--stat",
          label: "統計のみ",
          description: "ファイルごとの追加/削除行数サマリだけ表示",
        },
        {
          id: "name-only",
          flag: "--name-only",
          label: "ファイル名のみ",
          description: "変更されたファイルパスだけ一覧",
        },
        {
          id: "ignore-space",
          flag: "-w",
          label: "空白無視",
          description: "ホワイトスペースの差分を無視して本質的な変更に集中",
        },
        {
          id: "word-diff",
          flag: "--word-diff",
          label: "word-diff",
          description: "行単位ではなく単語単位で差分をハイライト",
        },
      ],
      texts: [
        {
          id: "target",
          placeholder: "path/to/file",
          label: "対象パス",
          description: "特定ファイル・ディレクトリに絞る（未指定なら全体）",
          suffix: true,
        },
        {
          id: "commit-range",
          flag: "",
          placeholder: "HEAD~3..HEAD",
          label: "コミット範囲",
          description: "`git diff A..B` 形式。履歴間の比較に使う",
          suffix: true,
        },
      ],
    },
    tip: "PR レビュー前は `git diff --staged` でコミット内容を最終確認する習慣が有効",
  },
  {
    id: "add",
    category: "workspace",
    title: "変更をステージングする",
    description: "コミット対象を Index に載せる",
    emoji: "➕",
    command: {
      base: "git add",
      toggles: [
        {
          id: "all",
          flag: "-A",
          label: "すべて",
          description: "新規・変更・削除を含む全変更をステージ（`--all` と同義）",
          defaultSelected: true,
          group: "scope",
        },
        {
          id: "update",
          flag: "-u",
          label: "追跡済みのみ",
          description: "既に Git 管理下のファイルの変更・削除だけステージ",
          group: "scope",
        },
        {
          id: "patch",
          flag: "-p",
          label: "対話的 (patch)",
          description: "hunk 単位で y/n/s など対話的に選んでステージ",
        },
        {
          id: "intent",
          flag: "--intent-to-add",
          label: "intent-to-add",
          description: "新規ファイルを「追加予定」としてマーク（内容はまだステージしない）",
        },
      ],
      texts: [
        {
          id: "paths",
          placeholder: "src/app.ts tests/",
          label: "パス指定",
          description: "特定ファイル・ディレクトリだけステージ（`-A` より優先）",
          suffix: true,
        },
      ],
    },
  },

  // --- commit ---
  {
    id: "commit",
    category: "commit",
    title: "コミットを作成する",
    description: "ステージ済み変更を履歴に記録する",
    emoji: "💾",
    command: {
      base: "git commit",
      toggles: [
        {
          id: "amend",
          flag: "--amend",
          label: "amend",
          description:
            "直前コミットに変更を統合。push 済みなら force push が必要",
          danger: true,
        },
        {
          id: "no-edit",
          flag: "--no-edit",
          label: "メッセージ維持",
          description: "amend 時、メッセージは変えずステージ済み変更だけ統合",
          requiresToggle: "amend",
        },
        {
          id: "all",
          flag: "-a",
          label: "追跡済みを自動 add",
          description: "変更・削除済み追跡ファイルを自動ステージしてコミット",
        },
        {
          id: "no-verify",
          flag: "--no-verify",
          label: "hook スキップ",
          description: "pre-commit / commit-msg フックを bypass（緊急時のみ）",
          danger: true,
        },
        {
          id: "signoff",
          flag: "--signoff",
          label: "signoff",
          description: "Signed-off-by 行をフッタに追加（オープンソース向け）",
        },
      ],
      texts: [
        {
          id: "message",
          flag: "-m",
          placeholder: "feat: add user auth",
          label: "メッセージ",
          description: "コミットメッセージ。amend 時は新メッセージの指定にも使える",
        },
      ],
    },
    tip: "Conventional Commits (`feat:`, `fix:`, `chore:`) にすると changelog 生成や検索が楽",
  },

  // --- branch ---
  {
    id: "branch-list",
    category: "branch",
    title: "ブランチ一覧を表示する",
    description: "ローカル / リモート / すべてのブランチを確認",
    emoji: "📋",
    command: {
      base: "git branch",
      radios: [
        {
          id: "local",
          flag: "",
          label: "ローカルのみ",
          description: "ローカルブランチだけ表示（デフォルト）",
          group: "scope",
          defaultSelected: true,
        },
        {
          id: "all",
          flag: "-a",
          label: "すべて",
          description: "ローカル + リモート追跡ブランチ",
          group: "scope",
        },
        {
          id: "remote",
          flag: "-r",
          label: "リモートのみ",
          description: "リモート追跡ブランチだけ表示",
          group: "scope",
        },
      ],
      toggles: [
        {
          id: "verbose",
          flag: "-v",
          label: "verbose",
          description: "各ブランチの最新コミット hash を表示",
        },
        {
          id: "very-verbose",
          flag: "-vv",
          label: "upstream 付き",
          description: "追跡ブランチと ahead/behind も表示",
          group: "verbose",
        },
      ],
    },
  },
  {
    id: "switch",
    category: "branch",
    title: "ブランチを切り替える",
    description: "切替・作成・detached HEAD",
    emoji: "🔀",
    command: {
      base: "git switch",
      radios: [
        {
          id: "switch",
          flag: "",
          label: "切り替え",
          description: "既存ブランチに移動",
          group: "mode",
          defaultSelected: true,
        },
        {
          id: "create",
          flag: "-c",
          label: "作成して切替",
          description: "新ブランチを作り、その場で移動",
          group: "mode",
        },
        {
          id: "detach",
          flag: "--detach",
          label: "detached HEAD",
          description: "特定コミットを直接 checkout（一時的な調査向け）",
          group: "mode",
        },
      ],
      toggles: [
        {
          id: "force",
          flag: "--force",
          label: "強制切替",
          description: "ローカル変更があってもブランチを切替（変更は失われる可能性）",
          danger: true,
        },
      ],
      texts: [
        {
          id: "branch",
          placeholder: "feature/auth",
          label: "ブランチ名",
          description: "切り替え先、または作成するブランチ名",
          suffix: true,
          excludeWhenRadio: { group: "mode", id: "detach" },
        },
        {
          id: "start-point",
          placeholder: "origin/main",
          label: "起点",
          description: "分岐元（省略時は現在の HEAD）",
          suffix: true,
          requiresRadio: { group: "mode", id: "create" },
        },
        {
          id: "rev",
          placeholder: "abc1234",
          label: "コミット",
          description: "コミット hash、タグ名など",
          suffix: true,
          requiresRadio: { group: "mode", id: "detach" },
        },
      ],
    },
  },
  {
    id: "merge",
    category: "branch",
    title: "ブランチをマージする",
    description: "feature を main などに統合する",
    emoji: "🔗",
    command: {
      base: "git merge",
      toggles: [
        {
          id: "no-ff",
          flag: "--no-ff",
          label: "no-ff",
          description: "fast-forward せずマージコミットを必ず作る（履歴が追いやすい）",
        },
        {
          id: "ff-only",
          flag: "--ff-only",
          label: "ff-only",
          description: "fast-forward できない場合は失敗（意図しないマージコミット防止）",
        },
        {
          id: "squash",
          flag: "--squash",
          label: "squash",
          description: "相手ブランチの変更を1コミット分としてステージ（コミットは別途）",
        },
        {
          id: "no-commit",
          flag: "--no-commit",
          label: "no-commit",
          description: "マージ結果をステージするがコミットは作らない（手動調整向け）",
        },
      ],
      texts: [
        {
          id: "branch",
          placeholder: "feature/auth",
          label: "マージ元ブランチ",
          description: "現在のブランチに取り込むブランチ名",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "rebase",
    category: "branch",
    title: "リベースで履歴を整理する",
    description: "main の最新の上に feature のコミットを載せ直す",
    emoji: "📐",
    command: {
      base: "git rebase",
      toggles: [
        {
          id: "interactive",
          flag: "-i",
          label: "interactive",
          description: "コミットの squash / reword / drop を対話的に編集",
        },
        {
          id: "onto",
          flag: "--onto",
          label: "--onto",
          description: "3点指定リベース。不要なコミットを除外しやすい",
        },
        {
          id: "autosquash",
          flag: "--autosquash",
          label: "autosquash",
          description: "fixup!/squash! コミットを自動で並べ替え（`-i` と併用）",
        },
      ],
      texts: [
        {
          id: "upstream",
          placeholder: "origin/main",
          label: "リベース先",
          description: "載せ直す基点。例: `git rebase origin/main`",
          suffix: true,
        },
      ],
    },
    warning: "push 済みブランチの rebase は force push が必要。共有ブランチでは merge を優先",
    related: [
      { label: "コンフリクト後に続行", command: "git rebase --continue" },
      { label: "リベースを中止", command: "git rebase --abort" },
    ],
  },

  // --- remote ---
  {
    id: "push",
    category: "remote",
    title: "リモートに push する",
    description: "ローカルコミットを origin 等に送信",
    emoji: "⬆️",
    command: {
      base: "git push",
      toggles: [
        {
          id: "set-upstream",
          flag: "-u",
          label: "upstream 設定",
          description: "初回 push 時に追跡ブランチを設定（以降 `git push` だけで OK）",
        },
        {
          id: "force-with-lease",
          flag: "--force-with-lease",
          label: "force-with-lease",
          description: "リモートが予期しない更新なら拒否する安全な force push",
          danger: true,
        },
        {
          id: "dry-run",
          flag: "--dry-run",
          label: "dry-run",
          description: "実際には push せず、何が送られるか確認",
        },
        {
          id: "tags",
          flag: "--tags",
          label: "tags も送る",
          description: "annotated tags も一緒に push",
        },
        {
          id: "delete",
          flag: "--delete",
          label: "ブランチ削除",
          description: "リモートブランチを削除（通常の push とは排他）",
          danger: true,
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "通常は origin。`git remote -v` で確認",
          defaultValue: "origin",
          suffix: true,
        },
        {
          id: "branch",
          placeholder: "feature/auth",
          label: "ブランチ",
          description: "push するローカルブランチ名",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "pull",
    category: "remote",
    title: "リモートの最新を取り込む",
    description: "fetch + merge（または rebase）で同期",
    emoji: "⬇️",
    command: {
      base: "git pull",
      toggles: [
        {
          id: "rebase",
          flag: "--rebase",
          label: "rebase で取込",
          description: "マージコミットを作らずリベースで取り込む（線形履歴向け）",
        },
        {
          id: "ff-only",
          flag: "--ff-only",
          label: "ff-only",
          description: "fast-forward できない場合は失敗させる",
        },
        {
          id: "no-commit",
          flag: "--no-commit",
          label: "no-commit",
          description: "マージ結果をステージするが自動コミットしない",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "pull 元リモート",
          defaultValue: "origin",
          suffix: true,
        },
        {
          id: "branch",
          placeholder: "main",
          label: "ブランチ",
          description: "取り込むリモートブランチ",
          suffix: true,
        },
      ],
    },
    related: [
      {
        label: "安全な代替",
        command: "git fetch origin && git merge origin/main",
        note: "fetch して差分確認してから merge",
      },
    ],
  },
  {
    id: "fetch",
    category: "remote",
    title: "fetch してリモート状態を更新する",
    description: "マージせずリモート参照だけ更新（pull の前半）",
    emoji: "📡",
    command: {
      base: "git fetch",
      toggles: [
        {
          id: "all",
          flag: "--all",
          label: "全リモート",
          description: "設定済みすべてのリモートから fetch",
        },
        {
          id: "prune",
          flag: "--prune",
          label: "prune",
          description: "リモートで削除されたブランチの追跡参照もローカルから削除",
        },
        {
          id: "tags",
          flag: "--tags",
          label: "tags も取得",
          description: "リモートのタグも更新",
        },
        {
          id: "dry-run",
          flag: "--dry-run",
          label: "dry-run",
          description: "実際には fetch せず動作確認",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "特定リモートだけ fetch（`--all` 未使用時）",
          defaultValue: "origin",
          suffix: true,
        },
      ],
    },
    related: [
      {
        label: "リモートとの差分確認",
        command: "git log HEAD..origin/main --oneline",
      },
      {
        label: "ahead/behind 確認",
        command: "git status -sb",
      },
    ],
  },

  // --- history ---
  {
    id: "log",
    category: "history",
    title: "コミット履歴を調査する",
    description: "ブランチの流れ・作者・変更ファイルを追う",
    emoji: "📜",
    command: {
      base: "git log",
      toggles: [
        {
          id: "oneline",
          flag: "--oneline",
          label: "1行表示",
          description: "ハッシュ + メッセージを1行ずつ（最もよく使う）",
        },
        {
          id: "graph",
          flag: "--graph",
          label: "グラフ",
          description: "ASCII グラフでブランチ分岐を可視化",
        },
        {
          id: "all",
          flag: "--all",
          label: "全ブランチ",
          description: "現在ブランチ以外も含めて表示",
        },
        {
          id: "decorate",
          flag: "--decorate",
          label: "decorate",
          description: "ブランチ名・タグ名をコミット横に表示",
        },
        {
          id: "stat",
          flag: "--stat",
          label: "stat",
          description: "各コミットの変更ファイル統計も表示",
        },
        {
          id: "patch",
          flag: "-p",
          label: "patch 付き",
          description: "各コミットの diff も表示（詳細調査向け）",
        },
      ],
      texts: [
        {
          id: "count",
          flag: "-n",
          placeholder: "20",
          label: "件数制限",
          description: "直近 N 件だけ表示",
        },
        {
          id: "author",
          flag: "--author",
          placeholder: "tanaka",
          label: "作者フィルタ",
          description: "作者名・メールの部分一致で絞り込み",
        },
        {
          id: "path",
          placeholder: "-- src/app.ts",
          label: "パス指定",
          description: "特定ファイルに関わったコミットだけ（`--` の後にパス）",
          suffix: true,
        },
      ],
    },
    tip: "定番: `git log --oneline --graph --decorate --all -20`",
  },
  {
    id: "show",
    category: "history",
    title: "特定コミットの中身を見る",
    description: "1コミット分のメタ情報と diff",
    emoji: "🔬",
    command: {
      base: "git show",
      toggles: [
        {
          id: "stat",
          flag: "--stat",
          label: "stat のみ",
          description: "diff 本体なしでファイル統計だけ",
        },
        {
          id: "name-only",
          flag: "--name-only",
          label: "ファイル名のみ",
          description: "変更されたファイルパスだけ",
        },
        {
          id: "format",
          flag: "--format=fuller",
          label: "fuller 形式",
          description: "Author / Committer / Date を詳細表示",
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "HEAD",
          label: "リビジョン",
          description: "コミット hash、HEAD、HEAD~1、ブランチ名など",
          defaultValue: "HEAD",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "blame",
    category: "history",
    title: "行ごとの変更者を調べる",
    description: "バグ混入コミットの特定に使う",
    emoji: "👤",
    command: {
      base: "git blame",
      toggles: [
        {
          id: "line-range",
          flag: "-L",
          label: "行範囲",
          description: "特定行だけ blame（`-L 10,20`）",
        },
        {
          id: "ignore-rev",
          flag: "--ignore-rev",
          label: "ignore-rev",
          description: "大規模フォーマットコミットを除外（`.git-blame-ignore-revs` と併用）",
        },
        {
          id: "show-email",
          flag: "-e",
          label: "メール表示",
          description: "作者名の代わりにメールアドレスを表示",
        },
      ],
      texts: [
        {
          id: "file",
          placeholder: "src/app.ts",
          label: "ファイル",
          description: "調査対象ファイルパス",
          suffix: true,
        },
        {
          id: "line-range-value",
          flag: "-L",
          placeholder: "10,20",
          label: "行範囲値",
          description: "`-L` 使用時の開始,終了行",
        },
      ],
    },
  },

  // --- recovery ---
  {
    id: "restore",
    category: "recovery",
    title: "ファイル変更を元に戻す",
    description: "作業ツリー / ステージングを HEAD 等の状態に復元",
    emoji: "↩️",
    command: {
      base: "git restore",
      radios: [
        {
          id: "worktree",
          flag: "",
          label: "作業ツリーを破棄",
          description: "編集内容を HEAD の状態に戻す",
          group: "target",
          defaultSelected: true,
        },
        {
          id: "staged",
          flag: "--staged",
          label: "ステージ解除",
          description: "Index から外す（作業ツリーの編集内容は残る）",
          group: "target",
        },
        {
          id: "worktree-only",
          flag: "--worktree",
          label: "作業ツリーのみ",
          description: "ステージは触らず作業ディレクトリだけ復元",
          group: "target",
        },
      ],
      toggles: [
        {
          id: "source",
          flag: "--source",
          label: "復元元指定",
          description: "HEAD 以外のコミットから復元（`--source=HEAD~1`）",
        },
      ],
      texts: [
        {
          id: "paths",
          placeholder: "src/app.ts",
          label: "対象パス",
          description: "復元するファイル・ディレクトリ",
          suffix: true,
        },
        {
          id: "source-rev",
          flag: "--source",
          placeholder: "HEAD~1",
          label: "復元元 rev",
          description: "`--source` 使用時のコミット指定",
        },
      ],
    },
    warning: "作業ツリーの未コミット変更は失われます。必要なら先に stash",
  },
  {
    id: "reset",
    category: "recovery",
    title: "HEAD / ステージを巻き戻す",
    description: "ローカル履歴のポインタ移動（共有前のみ推奨）",
    emoji: "⏪",
    command: {
      base: "git reset",
      radios: [
        {
          id: "soft",
          flag: "--soft",
          label: "soft",
          description: "コミットだけ取り消し。変更はステージに残る",
          group: "mode",
          defaultSelected: true,
        },
        {
          id: "mixed",
          flag: "--mixed",
          label: "mixed（default）",
          description: "コミット + ステージ取り消し。変更は作業ツリーに残る",
          group: "mode",
        },
        {
          id: "hard",
          flag: "--hard",
          label: "hard",
          description: "コミット + ステージ + 作業ツリーをすべて破棄",
          group: "mode",
          danger: true,
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "HEAD~1",
          label: "移動先",
          description:
            "HEAD を指し直す rev。`HEAD~1` はコミットが2件以上あるときのみ有効",
          suffix: true,
        },
      ],
    },
    warning:
      "push 済み履歴への reset + force push はチームを混乱させる。revert を優先。コミットが1件だけのリポジトリでは HEAD~1 は使えない",
  },
  {
    id: "revert",
    category: "recovery",
    title: "コミットを打ち消す（安全）",
    description: "履歴を消さず逆変更のコミットを追加",
    emoji: "🔁",
    command: {
      base: "git revert",
      toggles: [
        {
          id: "no-commit",
          flag: "--no-commit",
          label: "no-commit",
          description: "revert 結果をステージするがコミットは作らない",
        },
        {
          id: "no-edit",
          flag: "--no-edit",
          label: "メッセージ自動",
          description: "デフォルト revert メッセージでそのままコミット",
        },
        {
          id: "mainline",
          flag: "-m",
          label: "mainline",
          description: "マージコミット revert 時に親番号を指定（通常 1）",
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "abc1234",
          label: "対象コミット",
          description: "打ち消すコミット hash",
          suffix: true,
        },
        {
          id: "mainline-num",
          flag: "-m",
          placeholder: "1",
          label: "mainline 番号",
          description: "マージコミット revert 時の親番号",
        },
      ],
    },
    tip: "本番・共有ブランチでは reset より revert が安全",
  },
  {
    id: "stash",
    category: "recovery",
    title: "stash 操作",
    description: "変更の退避・適用・一覧",
    emoji: "📦",
    command: {
      base: "git stash",
      radios: [
        {
          id: "push",
          flag: "push",
          label: "退避",
          description: "変更を stash に退避",
          group: "subcmd",
          defaultSelected: true,
        },
        {
          id: "pop",
          flag: "pop",
          label: "適用して削除",
          description: "最新 stash を戻し、リストから削除",
          group: "subcmd",
        },
        {
          id: "apply",
          flag: "apply",
          label: "適用",
          description: "stash を戻すがリストには残す",
          group: "subcmd",
        },
        {
          id: "list",
          flag: "list",
          label: "一覧",
          description: "stash 一覧を表示",
          group: "subcmd",
        },
      ],
      toggles: [
        {
          id: "include-untracked",
          flag: "-u",
          label: "untracked 含む",
          description: "未追跡ファイルも stash に含める",
          requiresRadio: { group: "subcmd", id: "push" },
        },
        {
          id: "keep-index",
          flag: "--keep-index",
          label: "keep-index",
          description: "ステージ済み変更はそのまま残して stash",
          requiresRadio: { group: "subcmd", id: "push" },
        },
      ],
      texts: [
        {
          id: "message",
          flag: "-m",
          placeholder: "WIP: auth refactor",
          label: "メッセージ",
          description: "stash の識別用メモ",
          requiresRadio: { group: "subcmd", id: "push" },
        },
        {
          id: "path",
          placeholder: "src/auth/",
          label: "パス限定",
          description: "特定パスだけ stash",
          suffix: true,
          requiresRadio: { group: "subcmd", id: "push" },
        },
        {
          id: "ref",
          placeholder: "stash@{0}",
          label: "stash 指定",
          description: "省略時は最新。`stash@{1}` のように番号指定可",
          suffix: true,
          requiresRadio: { group: "subcmd", id: "pop" },
        },
        {
          id: "ref-apply",
          placeholder: "stash@{0}",
          label: "stash 指定",
          description: "省略時は最新。`stash@{1}` のように番号指定可",
          suffix: true,
          requiresRadio: { group: "subcmd", id: "apply" },
        },
      ],
    },
  },
];

export function getGoalsByCategory(categoryId: CategoryId): Goal[] {
  return goals.filter((g) => g.category === categoryId);
}

export function getGoalById(id: string): Goal | undefined {
  return goals.find((g) => g.id === id);
}
