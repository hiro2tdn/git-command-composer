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
  /** 指定 radio が選択されているときは非表示 */
  excludeWhenRadio?: { group: string; id: string };
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
    description: "log / show",
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
      texts: [
        {
          id: "path",
          placeholder: ".",
          label: "ディレクトリ",
          description: "省略時はカレント",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "clone",
    category: "setup",
    title: "リポジトリをクローンする",
    description: "リモートリポジトリをローカルに複製する",
    emoji: "📥",
    command: {
      base: "git clone",
      texts: [
        {
          id: "branch",
          flag: "-b",
          placeholder: "main",
          label: "ブランチ指定",
          description: "チェックアウトするブランチ",
        },
        {
          id: "url",
          placeholder: "https://github.com/user/repo.git",
          label: "リポジトリ URL",
          description: "クローン元の URL",
          suffix: true,
        },
        {
          id: "directory",
          placeholder: "repo",
          label: "配置ディレクトリ名",
          description: "省略時はリポジトリ名",
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
          description: "通常は origin",
          defaultValue: "origin",
          suffix: true,
        },
        {
          id: "url",
          placeholder: "https://github.com/user/repo.git",
          label: "URL",
          description: "リモートリポジトリの URL",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "remote-list",
    category: "setup",
    title: "リモート一覧を表示する",
    description: "登録済みリモートと URL を確認",
    emoji: "📋",
    command: {
      base: "git remote",
      toggles: [
        {
          id: "verbose",
          flag: "-v",
          label: "URL も表示",
          description: "`git remote -v` と同じ",
          defaultSelected: true,
        },
      ],
    },
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
          flag: "-sb",
          label: "短い形式",
          description: "ブランチ名付きコンパクト表示",
        },
      ],
    },
  },
  {
    id: "diff",
    category: "workspace",
    title: "差分を見る",
    description: "未ステージ / ステージ済みの変更を確認",
    emoji: "🔍",
    command: {
      base: "git diff",
      toggles: [
        {
          id: "staged",
          flag: "--staged",
          label: "ステージ済み",
          description: "次のコミットに入る変更だけ",
        },
        {
          id: "stat",
          flag: "--stat",
          label: "統計のみ",
          description: "ファイルごとの追加/削除行数",
        },
        {
          id: "name-only",
          flag: "--name-only",
          label: "ファイル名のみ",
          description: "変更されたファイルパスだけ",
        },
      ],
      texts: [
        {
          id: "target",
          placeholder: "path/to/file",
          label: "対象パス",
          description: "特定ファイル・ディレクトリに絞る",
          suffix: true,
        },
      ],
    },
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
          description: "新規・変更・削除を含む全変更",
          defaultSelected: true,
          group: "scope",
        },
        {
          id: "update",
          flag: "-u",
          label: "追跡済みのみ",
          description: "管理下ファイルの変更・削除だけ",
          group: "scope",
        },
      ],
      texts: [
        {
          id: "paths",
          placeholder: "src/app.ts",
          label: "パス指定",
          description: "特定ファイル・ディレクトリだけ",
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
          description: "直前コミットに統合。push 済みなら force push が必要",
          danger: true,
        },
        {
          id: "no-edit",
          flag: "--no-edit",
          label: "メッセージ維持",
          description: "amend 時、メッセージは変えず変更だけ統合",
          requiresToggle: "amend",
        },
        {
          id: "all",
          flag: "-a",
          label: "追跡済みを自動 add",
          description: "変更済み追跡ファイルを自動ステージしてコミット",
        },
      ],
      texts: [
        {
          id: "message",
          flag: "-m",
          placeholder: "feat: add user auth",
          label: "メッセージ",
          description: "コミットメッセージ",
        },
      ],
    },
  },

  // --- branch ---
  {
    id: "branch",
    category: "branch",
    title: "ブランチ操作",
    description: "一覧・作成・削除",
    emoji: "🌿",
    command: {
      base: "git branch",
      radios: [
        {
          id: "list",
          flag: "",
          label: "一覧",
          description: "ブランチ一覧を表示",
          group: "action",
          defaultSelected: true,
        },
        {
          id: "create",
          flag: "",
          label: "作成",
          description: "ブランチを作る（切り替えは git switch）",
          group: "action",
        },
        {
          id: "delete",
          flag: "-d",
          label: "削除",
          description: "マージ済みブランチを削除",
          group: "action",
        },
        {
          id: "force-delete",
          flag: "-D",
          label: "強制削除",
          description: "未マージでも削除",
          group: "action",
          danger: true,
        },
      ],
      toggles: [
        {
          id: "all",
          flag: "-a",
          label: "リモートも含む",
          description: "ローカル + リモート追跡ブランチ",
          requiresRadio: { group: "action", id: "list" },
        },
        {
          id: "verbose",
          flag: "-vv",
          label: "upstream 付き",
          description: "追跡ブランチと ahead/behind",
          requiresRadio: { group: "action", id: "list" },
        },
      ],
      texts: [
        {
          id: "name",
          placeholder: "feature/auth",
          label: "ブランチ名",
          description: "作成・削除対象",
          suffix: true,
          excludeWhenRadio: { group: "action", id: "list" },
        },
        {
          id: "start-point",
          placeholder: "origin/main",
          label: "起点",
          description: "作成時の分岐元（省略時は HEAD）",
          suffix: true,
          requiresRadio: { group: "action", id: "create" },
        },
      ],
    },
  },
  {
    id: "switch",
    category: "branch",
    title: "ブランチを切り替える",
    description: "別ブランチへ移動、または作成して移動",
    emoji: "🔀",
    command: {
      base: "git switch",
      toggles: [
        {
          id: "create",
          flag: "-c",
          label: "作成して切替",
          description: "新ブランチを作ってその場で移動",
        },
      ],
      texts: [
        {
          id: "branch",
          placeholder: "feature/auth",
          label: "ブランチ名",
          description: "切り替え先",
          suffix: true,
        },
        {
          id: "start-point",
          placeholder: "origin/main",
          label: "起点",
          description: "`-c` 使用時の分岐元",
          suffix: true,
          requiresToggle: "create",
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
          description: "マージコミットを必ず作る",
        },
      ],
      texts: [
        {
          id: "branch",
          placeholder: "feature/auth",
          label: "マージ元ブランチ",
          description: "現在のブランチに統合する元",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "rebase",
    category: "branch",
    title: "リベースする",
    description: "main の最新の上に feature のコミットを載せ直す",
    emoji: "📐",
    command: {
      base: "git rebase",
      toggles: [
        {
          id: "interactive",
          flag: "-i",
          label: "interactive",
          description: "コミットの squash / reword / drop を編集",
        },
      ],
      texts: [
        {
          id: "upstream",
          placeholder: "origin/main",
          label: "リベース先",
          description: "載せ直す先（例: origin/main）",
          suffix: true,
        },
      ],
    },
    warning: "push 済みブランチの rebase は force push が必要",
  },
  {
    id: "cherry-pick",
    category: "branch",
    title: "コミットを取り込む",
    description: "特定コミットの変更だけ現在のブランチに適用",
    emoji: "🍒",
    command: {
      base: "git cherry-pick",
      texts: [
        {
          id: "rev",
          placeholder: "abc1234",
          label: "コミット",
          description: "取り込むコミット hash",
          suffix: true,
        },
      ],
    },
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
          description: "初回 push 時に追跡ブランチを設定",
        },
        {
          id: "force-with-lease",
          flag: "--force-with-lease",
          label: "force-with-lease",
          description: "安全な force push",
          danger: true,
        },
        {
          id: "delete",
          flag: "--delete",
          label: "ブランチ削除",
          description: "リモートブランチを削除",
          danger: true,
        },
        {
          id: "tags",
          flag: "--tags",
          label: "tags も送る",
          description: "タグも一緒に push",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "push 先リモート",
          defaultValue: "origin",
          suffix: true,
        },
        {
          id: "branch",
          placeholder: "feature/auth",
          label: "ブランチ",
          description: "push するブランチ",
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
          description: "マージコミットを作らずリベース",
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
          description: "取り込むブランチ",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "fetch",
    category: "remote",
    title: "fetch する",
    description: "リモートの最新情報を取得（マージはしない）",
    emoji: "📡",
    command: {
      base: "git fetch",
      toggles: [
        {
          id: "all",
          flag: "--all",
          label: "全リモート",
          description: "すべてのリモートから取得",
        },
        {
          id: "prune",
          flag: "--prune",
          label: "prune",
          description: "削除済みリモートブランチの参照を整理",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "fetch 元リモート",
          defaultValue: "origin",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "tag",
    category: "remote",
    title: "タグを操作する",
    description: "リリースタグの作成・一覧",
    emoji: "🏷️",
    command: {
      base: "git tag",
      radios: [
        {
          id: "list",
          flag: "",
          label: "一覧",
          description: "タグ一覧を表示",
          group: "action",
          defaultSelected: true,
        },
        {
          id: "annotated",
          flag: "-a",
          label: "annotated 作成",
          description: "メッセージ付きタグを作成",
          group: "action",
        },
        {
          id: "lightweight",
          flag: "",
          label: "lightweight 作成",
          description: "メッセージなしタグを作成",
          group: "action",
        },
      ],
      texts: [
        {
          id: "name",
          placeholder: "v1.0.0",
          label: "タグ名",
          description: "例: v1.0.0",
          suffix: true,
          excludeWhenRadio: { group: "action", id: "list" },
        },
        {
          id: "message",
          flag: "-m",
          placeholder: "Release v1.0.0",
          label: "メッセージ",
          description: "annotated タグ用",
          requiresRadio: { group: "action", id: "annotated" },
        },
      ],
    },
  },

  // --- history ---
  {
    id: "log",
    category: "history",
    title: "コミット履歴を見る",
    description: "ブランチのコミット履歴を確認",
    emoji: "📜",
    command: {
      base: "git log",
      toggles: [
        {
          id: "oneline",
          flag: "--oneline",
          label: "1行表示",
          description: "ハッシュ + メッセージを1行ずつ",
        },
        {
          id: "graph",
          flag: "--graph",
          label: "グラフ",
          description: "ブランチ分岐を可視化",
        },
        {
          id: "all",
          flag: "--all",
          label: "全ブランチ",
          description: "すべてのブランチを表示",
        },
      ],
      texts: [
        {
          id: "count",
          flag: "-n",
          placeholder: "20",
          label: "件数制限",
          description: "直近 N 件だけ",
        },
        {
          id: "path",
          placeholder: "-- src/app.ts",
          label: "パス指定",
          description: "特定ファイルの履歴だけ見る",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "show",
    category: "history",
    title: "特定コミットの中身を見る",
    description: "1コミット分の diff",
    emoji: "🔬",
    command: {
      base: "git show",
      toggles: [
        {
          id: "stat",
          flag: "--stat",
          label: "stat のみ",
          description: "diff なしでファイル統計だけ",
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "HEAD",
          label: "コミット",
          description: "hash、HEAD、ブランチ名など",
          defaultValue: "HEAD",
          suffix: true,
        },
      ],
    },
  },

  // --- recovery ---
  {
    id: "restore",
    category: "recovery",
    title: "ファイル変更を元に戻す",
    description: "作業ツリー / ステージを復元",
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
          description: "Index から外す（編集内容は残る）",
          group: "target",
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
      ],
    },
    warning: "未コミット変更は失われます",
  },
  {
    id: "reset",
    category: "recovery",
    title: "HEAD / ステージを巻き戻す",
    description: "ローカル履歴のポインタ移動",
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
          label: "mixed",
          description: "コミット + ステージ取り消し",
          group: "mode",
        },
        {
          id: "hard",
          flag: "--hard",
          label: "hard",
          description: "コミット + ステージ + 作業ツリーを破棄",
          group: "mode",
          danger: true,
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "HEAD~1",
          label: "移動先",
          description: "HEAD~1 はコミットが2件以上あるときのみ有効",
          suffix: true,
        },
      ],
    },
    warning: "push 済み履歴への reset は force push が必要。revert を優先",
  },
  {
    id: "revert",
    category: "recovery",
    title: "コミットを打ち消す",
    description: "履歴を消さず逆変更のコミットを追加",
    emoji: "🔁",
    command: {
      base: "git revert",
      texts: [
        {
          id: "rev",
          placeholder: "abc1234",
          label: "対象コミット",
          description: "打ち消すコミット hash",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "stash",
    category: "recovery",
    title: "stash 操作",
    description: "変更の退避・適用",
    emoji: "📦",
    command: {
      base: "git stash",
      radios: [
        {
          id: "push",
          flag: "push",
          label: "退避",
          description: "作業中の変更を一時退避",
          group: "subcmd",
          defaultSelected: true,
        },
        {
          id: "pop",
          flag: "pop",
          label: "適用して削除",
          description: "最新 stash を適用して削除",
          group: "subcmd",
        },
        {
          id: "apply",
          flag: "apply",
          label: "適用",
          description: "stash を適用（一覧には残る）",
          group: "subcmd",
        },
        {
          id: "list",
          flag: "list",
          label: "一覧",
          description: "退避済み stash の一覧",
          group: "subcmd",
        },
      ],
      toggles: [
        {
          id: "include-untracked",
          flag: "-u",
          label: "untracked 含む",
          description: "未追跡ファイルも退避",
          requiresRadio: { group: "subcmd", id: "push" },
        },
      ],
      texts: [
        {
          id: "message",
          flag: "-m",
          placeholder: "WIP",
          label: "メッセージ",
          description: "stash の識別用メモ",
          requiresRadio: { group: "subcmd", id: "push" },
        },
        {
          id: "ref",
          placeholder: "stash@{0}",
          label: "stash 指定",
          description: "省略時は最新",
          suffix: true,
          requiresRadio: { group: "subcmd", id: "pop" },
        },
        {
          id: "ref-apply",
          placeholder: "stash@{0}",
          label: "stash 指定",
          description: "省略時は最新",
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
