export type CategoryId =
  | "setup"
  | "commit"
  | "branch"
  | "remote"
  | "recovery"
  | "workspace"
  | "history";

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
  /** git とサブコマンドの間に挿入（例: git --no-pager diff） */
  global?: boolean;
  /** コマンドには付けず、他オプションの制御だけに使う */
  controlOnly?: boolean;
};

export type RadioOption = {
  id: string;
  flag: string;
  label: string;
  description: string;
  group: string;
  defaultSelected?: boolean;
  danger?: boolean;
  /** 指定 radio が選択されているときだけ表示 */
  requiresRadio?: { group: string; id: string };
  /** 「入力する値」セクションに表示 */
  inlineWithTexts?: boolean;
  /** コマンドには付けず、他オプションの制御だけに使う */
  controlOnly?: boolean;
  /** inlineWithTexts 時のグループ見出し（先頭 option のみ） */
  groupLabel?: string;
  /** この text の直後にグループを挿入（先頭 option のみ） */
  groupInsertAfter?: string;
};

export type TextOption = {
  id: string;
  flag?: string;
  placeholder: string;
  label: string;
  description: string;
  defaultValue?: string;
  suffix?: boolean;
  /** 未入力だとコマンドが成立しない */
  required?: boolean;
  /** 指定 toggle が ON のとき必須 */
  requiredWhenToggle?: string;
  /** この toggle が ON のときだけ表示・適用 */
  requiresToggle?: string;
  /** いずれかの toggle が ON なら適用しない */
  excludeWhenToggles?: string[];
  /** 指定 radio が選択されているときだけ表示・適用 */
  requiresRadio?: { group: string; id: string };
  /** 指定 radio が選択されているときは非表示 */
  excludeWhenRadio?: { group: string; id: string };
  /** 別 text と結合して1引数にする（例: main..feature） */
  combineWith?: {
    id: string;
    separator: string;
    separatorRadio?: { group: string; threeDotId: string };
    /** この text が空のとき partner に値があれば使う代替値 */
    emptyFallback?: string;
  };
};

/** 含める / 除外する pathspec を GUI で組み立てる */
export type PathspecOption = {
  id: string;
  label: string;
  description: string;
  /** 除外のクイック追加候補 */
  excludeSuggestions?: string[];
  requiresRadio?: { group: string; id: string };
  excludeWhenRadio?: { group: string; id: string };
};

export type CommandConfig = {
  base: string;
  toggles?: ToggleOption[];
  radios?: RadioOption[];
  texts?: TextOption[];
  pathspecs?: PathspecOption[];
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
    description: "init / clone",
  },
  {
    id: "commit",
    label: "ステージ・コミット",
    emoji: "📝",
    description: "add / commit",
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
    description: "remote / push / pull / fetch",
  },
  {
    id: "recovery",
    label: "修復",
    emoji: "🛠️",
    description: "restore / reset / revert / stash",
  },
  {
    id: "workspace",
    label: "変更確認",
    emoji: "📂",
    description: "status / diff",
  },
  {
    id: "history",
    label: "履歴調査",
    emoji: "🔎",
    description: "log / show / reflog",
  },
];

export const goals: Goal[] = [
  // --- setup ---
  {
    id: "init",
    category: "setup",
    title: "カレントディレクトリを新しい Git リポジトリとして初期化する",
    emoji: "📁",
    command: {
      base: "git init",
      texts: [
        {
          id: "path",
          placeholder: ".",
          label: "ディレクトリ",
          description: "初期化するディレクトリ（省略時はカレントディレクトリ）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "clone",
    category: "setup",
    title: "リモートリポジトリをローカルへクローンする",
    emoji: "📥",
    command: {
      base: "git clone",
      texts: [
        {
          id: "branch",
          flag: "-b",
          placeholder: "main",
          label: "ブランチ指定",
          description: "clone 後に checkout するブランチ（省略時はデフォルトブランチ）",
        },
        {
          id: "url",
          placeholder: "https://github.com/user/repo.git",
          label: "リポジトリ URL",
          description: "クローン元の URL",
          required: true,
          suffix: true,
        },
        {
          id: "directory",
          placeholder: "repo",
          label: "配置ディレクトリ名",
          description: "clone 先のディレクトリ名（省略時はリポジトリ名）",
          suffix: true,
        },
      ],
    },
  },

  // --- commit ---
  {
    id: "add",
    category: "commit",
    title: "変更をステージングする",
    emoji: "➕",
    command: {
      base: "git add",
      toggles: [
        {
          id: "all",
          flag: "-A",
          label: "すべて",
          description: "新規・変更・削除をすべて対象にする",
          group: "scope",
        },
        {
          id: "update",
          flag: "-u",
          label: "追跡済みのみ",
          description: "追跡済みファイルの変更・削除のみ対象にする",
          group: "scope",
        },
      ],
      texts: [
        {
          id: "paths",
          placeholder: "src/app.ts",
          label: "パス指定",
          description: "対象ファイルやディレクトリ（-A/-u 選択時は省略可）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "commit",
    category: "commit",
    title: "ステージ済みの変更を履歴に記録する",
    emoji: "💾",
    command: {
      base: "git commit",
      toggles: [
        {
          id: "amend",
          flag: "--amend",
          label: "直前コミットを修正",
          description: "直前のコミットに変更を統合（push 済みなら強制 push が必要）",
          danger: true,
        },
        {
          id: "no-edit",
          flag: "--no-edit",
          label: "メッセージ維持",
          description: "修正時もメッセージは変更しない",
          requiresToggle: "amend",
        },
        {
          id: "all",
          flag: "-a",
          label: "追跡済みを自動ステージ",
          description: "変更済みの追跡ファイルを自動でステージしてコミット",
        },
      ],
      texts: [
        {
          id: "message",
          flag: "-m",
          placeholder: "feat: add user auth",
          label: "メッセージ",
          description: "コミットメッセージ（省略時はエディタを開く）",
        },
      ],
    },
  },

  // --- branch ---
  {
    id: "branch",
    category: "branch",
    title: "ブランチの一覧表示・作成・削除を行う",
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
          description: "ブランチを作成（切り替えは git switch）",
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
          description: "未マージのブランチも削除",
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
          label: "ahead/behind 表示",
          description: "追跡ブランチとの先行・遅延件数も表示",
          requiresRadio: { group: "action", id: "list" },
        },
      ],
      texts: [
        {
          id: "name",
          placeholder: "main",
          label: "ブランチ名",
          description: "作成・削除対象のブランチ名",
          required: true,
          suffix: true,
          excludeWhenRadio: { group: "action", id: "list" },
        },
        {
          id: "start-point",
          placeholder: "HEAD",
          label: "起点",
          description: "新ブランチの分岐元（省略時は HEAD）",
          suffix: true,
          requiresRadio: { group: "action", id: "create" },
        },
      ],
    },
  },
  {
    id: "switch",
    category: "branch",
    title: "別ブランチへ切り替える",
    emoji: "🔀",
    command: {
      base: "git switch",
      toggles: [
        {
          id: "create",
          flag: "-c",
          label: "作成して切り替え",
          description: "新しいブランチを作成して移動",
        },
      ],
      texts: [
        {
          id: "branch",
          placeholder: "main",
          label: "ブランチ名",
          description: "切り替え先のブランチ名",
          required: true,
          suffix: true,
        },
        {
          id: "start-point",
          placeholder: "HEAD",
          label: "起点",
          description: "新ブランチの分岐元（省略時は HEAD）",
          suffix: true,
          requiresToggle: "create",
        },
      ],
    },
  },
  {
    id: "merge",
    category: "branch",
    title: "別ブランチの変更を現在のブランチに統合する",
    emoji: "🔗",
    command: {
      base: "git merge",
      toggles: [
        {
          id: "no-ff",
          flag: "--no-ff",
          label: "マージコミット固定",
          description: "fast-forward せずマージコミットを残す",
        },
      ],
      texts: [
        {
          id: "branch",
          placeholder: "main",
          label: "マージ元ブランチ",
          description: "統合元のブランチ（省略時は追跡ブランチ）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "rebase",
    category: "branch",
    title: "別ブランチの先端にコミットを並べ直す",
    emoji: "📐",
    command: {
      base: "git rebase",
      toggles: [
        {
          id: "interactive",
          flag: "-i",
          label: "インタラクティブ編集",
          description: "コミットの順序や内容を対話的に編集",
        },
      ],
      texts: [
        {
          id: "upstream",
          placeholder: "origin/main",
          label: "リベース先",
          description: "並べ直す基準ブランチ（省略時は追跡ブランチ）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "cherry-pick",
    category: "branch",
    title: "指定コミットの変更だけを現在のブランチに取り込む",
    emoji: "🍒",
    command: {
      base: "git cherry-pick",
      texts: [
        {
          id: "rev",
          placeholder: "abc1234",
          label: "コミット",
          description: "取り込むコミットの hash",
          required: true,
          suffix: true,
        },
      ],
    },
  },

  // --- remote ---
  {
    id: "remote",
    category: "remote",
    title: "リモートの一覧表示や URL の登録を行う",
    emoji: "🔗",
    command: {
      base: "git remote",
      radios: [
        {
          id: "list",
          flag: "",
          label: "一覧",
          description: "登録済みリモートを表示",
          group: "action",
          defaultSelected: true,
        },
        {
          id: "add",
          flag: "add",
          label: "追加",
          description: "新しいリモートを登録",
          group: "action",
        },
      ],
      toggles: [
        {
          id: "verbose",
          flag: "-v",
          label: "URL も表示",
          description: "fetch / push の URL も表示",
          requiresRadio: { group: "action", id: "list" },
        },
      ],
      texts: [
        {
          id: "name",
          placeholder: "origin",
          label: "リモート名",
          description: "追加するリモートの名前",
          defaultValue: "origin",
          required: true,
          suffix: true,
          requiresRadio: { group: "action", id: "add" },
        },
        {
          id: "url",
          placeholder: "https://github.com/user/repo.git",
          label: "URL",
          description: "リモートリポジトリの URL",
          required: true,
          suffix: true,
          requiresRadio: { group: "action", id: "add" },
        },
      ],
    },
  },
  {
    id: "push",
    category: "remote",
    title: "ローカルのコミットをリモートへ送信する",
    emoji: "⬆️",
    command: {
      base: "git push",
      toggles: [
        {
          id: "set-upstream",
          flag: "-u",
          label: "追跡ブランチ設定",
          description: "初回 push 時に追跡ブランチを設定する",
        },
        {
          id: "force-with-lease",
          flag: "--force-with-lease",
          label: "安全な強制 push",
          description: "リモートの更新を確認してから上書きする",
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
          label: "タグも送る",
          description: "タグもリモートへ送る",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description:
            "送信先リモート（省略時は追跡ブランチのリモート。削除時は必須）",
          requiredWhenToggle: "delete",
          suffix: true,
        },
        {
          id: "branch",
          placeholder: "main",
          label: "ブランチ",
          description:
            "送るブランチ（省略時は現在のブランチ。削除時は必須）",
          requiredWhenToggle: "delete",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "pull",
    category: "remote",
    title: "リモートの変更を取得して取り込む",
    emoji: "⬇️",
    command: {
      base: "git pull",
      toggles: [
        {
          id: "rebase",
          flag: "--rebase",
          label: "rebase で取り込む",
          description: "マージコミットを作らず rebase する",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "取得元リモート（省略時は追跡ブランチのリモート）",
          suffix: true,
        },
        {
          id: "branch",
          placeholder: "main",
          label: "ブランチ",
          description: "取得するブランチ（省略時は追跡ブランチ）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "fetch",
    category: "remote",
    title: "リモートの最新情報を取得する（マージはしない）",
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
          label: "削除済み参照を整理",
          description: "削除済みリモートブランチの参照を整理",
        },
      ],
      texts: [
        {
          id: "remote",
          placeholder: "origin",
          label: "リモート名",
          description: "取得元リモート（省略時は追跡ブランチのリモート、未設定時は origin）",
          suffix: true,
          excludeWhenToggles: ["all"],
        },
      ],
    },
  },
  {
    id: "tag",
    category: "remote",
    title: "リリースタグの一覧表示や作成を行う",
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
          label: "注釈付き",
          description: "メッセージ付きのタグを作成",
          group: "action",
        },
        {
          id: "lightweight",
          flag: "",
          label: "軽量",
          description: "メッセージなしのタグを作成",
          group: "action",
        },
      ],
      texts: [
        {
          id: "name",
          placeholder: "v1.0.0",
          label: "タグ名",
          description: "作成するタグ名（例: v1.0.0）",
          required: true,
          suffix: true,
          excludeWhenRadio: { group: "action", id: "list" },
        },
        {
          id: "message",
          flag: "-m",
          placeholder: "Release v1.0.0",
          label: "メッセージ",
          description: "タグメッセージ（省略時はエディタを開く）",
          requiresRadio: { group: "action", id: "annotated" },
        },
      ],
    },
  },

  // --- recovery ---
  {
    id: "restore",
    category: "recovery",
    title: "作業ツリーやステージのファイル変更を元に戻す",
    emoji: "↩️",
    command: {
      base: "git restore",
      radios: [
        {
          id: "worktree",
          flag: "",
          label: "作業ツリーを破棄",
          description: "編集内容を元の状態に戻す",
          group: "target",
          defaultSelected: true,
        },
        {
          id: "staged",
          flag: "--staged",
          label: "ステージ解除",
          description: "ステージを元に戻す（作業ツリーはそのまま）",
          group: "target",
        },
      ],
      texts: [
        {
          id: "source",
          flag: "--source",
          placeholder: "HEAD~1",
          label: "復元元",
          description: "コミット hash や HEAD~1 など（省略時は HEAD）",
        },
        {
          id: "paths",
          placeholder: "src/app.ts",
          label: "対象パス",
          description: "復元するファイル・ディレクトリ",
          required: true,
          suffix: true,
        },
      ],
    },
    warning: "未コミット変更は失われます",
  },
  {
    id: "reset",
    category: "recovery",
    title: "ブランチの先頭（HEAD）やステージの位置を巻き戻す",
    emoji: "⏪",
    command: {
      base: "git reset",
      radios: [
        {
          id: "soft",
          flag: "--soft",
          label: "soft（コミットのみ取消）",
          description: "コミットのみ取り消し（変更はステージに残る）",
          group: "mode",
        },
        {
          id: "mixed",
          flag: "--mixed",
          label: "mixed（ステージも取消）",
          description: "コミットとステージを取り消し",
          group: "mode",
          defaultSelected: true,
        },
        {
          id: "hard",
          flag: "--hard",
          label: "hard（破棄あり）",
          description: "コミット・ステージ・作業ツリーを破棄",
          group: "mode",
          danger: true,
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "HEAD",
          label: "戻す位置",
          description: "戻す位置（省略時は HEAD）",
          suffix: true,
        },
      ],
    },
    warning:
      "push 済みのコミットを消すと強制 push が必要です。共有ブランチでは revert を使ってください",
  },
  {
    id: "revert",
    category: "recovery",
    title: "打ち消し用の新しいコミットを追加する",
    emoji: "🔁",
    command: {
      base: "git revert",
      texts: [
        {
          id: "rev",
          placeholder: "abc1234",
          label: "対象コミット",
          description: "打ち消すコミットの hash",
          required: true,
          suffix: true,
        },
      ],
    },
  },
  {
    id: "stash",
    category: "recovery",
    title: "未コミットの変更を一時退避したり戻したりする",
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
          description: "最新の退避を適用して削除",
          group: "subcmd",
        },
        {
          id: "apply",
          flag: "apply",
          label: "適用",
          description: "退避を適用（一覧には残る）",
          group: "subcmd",
        },
        {
          id: "list",
          flag: "list",
          label: "一覧",
          description: "退避済みの一覧を表示",
          group: "subcmd",
        },
      ],
      toggles: [
        {
          id: "include-untracked",
          flag: "-u",
          label: "未追跡も含む",
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
          description: "退避の識別メモ（省略時は自動生成）",
          requiresRadio: { group: "subcmd", id: "push" },
        },
        {
          id: "ref",
          placeholder: "stash@{0}",
          label: "退避の指定",
          description: "対象の退避（省略時は stash@{0}）",
          suffix: true,
          requiresRadio: { group: "subcmd", id: "pop" },
        },
        {
          id: "ref-apply",
          placeholder: "stash@{0}",
          label: "退避の指定",
          description: "対象の退避（省略時は stash@{0}）",
          suffix: true,
          requiresRadio: { group: "subcmd", id: "apply" },
        },
      ],
    },
  },

  // --- workspace ---
  {
    id: "status",
    category: "workspace",
    title: "未ステージ・ステージ済み・未追跡の状態を確認する",
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
    title: "作業ツリー・ステージ・ブランチ間の差分を確認する",
    emoji: "🔍",
    command: {
      base: "git diff",
      radios: [
        {
          id: "worktree",
          flag: "",
          label: "作業ツリー",
          description: "作業ツリーとステージの未コミット変更",
          group: "compare",
          defaultSelected: true,
        },
        {
          id: "branches",
          flag: "",
          label: "ブランチ比較",
          description: "2つのブランチやコミット間の差分",
          group: "compare",
        },
        {
          id: "two-dot",
          flag: "",
          label: "直接比較 (..)",
          description: "比較範囲の書き方（例: main..feature）",
          group: "range-syntax",
          groupLabel: "比較の書き方",
          groupInsertAfter: "branch-to",
          requiresRadio: { group: "compare", id: "branches" },
          inlineWithTexts: true,
          controlOnly: true,
        },
        {
          id: "three-dot",
          flag: "",
          label: "共通祖先差分",
          description: "共通祖先からの差分（例: main...feature）",
          group: "range-syntax",
          defaultSelected: true,
          requiresRadio: { group: "compare", id: "branches" },
          inlineWithTexts: true,
          controlOnly: true,
        },
      ],
      toggles: [
        {
          id: "no-pager",
          flag: "--no-pager",
          label: "ページャ無効",
          description: "ページャなしで標準出力へ出す（スクリプト向け）",
          global: true,
        },
        {
          id: "no-color",
          flag: "--no-color",
          label: "色なし",
          description: "色付き出力を無効化",
        },
        {
          id: "staged",
          flag: "--staged",
          label: "ステージ済み",
          description: "ステージ済みの変更のみ",
        },
        {
          id: "stat",
          flag: "--stat",
          label: "統計のみ",
          description: "追加・削除行数の概要のみ",
        },
        {
          id: "name-only",
          flag: "--name-only",
          label: "ファイル名のみ",
          description: "変更ファイルのパスのみ",
        },
      ],
      texts: [
        {
          id: "branch-from",
          placeholder: "HEAD",
          label: "比較元",
          description: "比較元（省略時は HEAD）",
          suffix: true,
          requiresRadio: { group: "compare", id: "branches" },
          combineWith: {
            id: "branch-to",
            separator: "..",
            separatorRadio: { group: "range-syntax", threeDotId: "three-dot" },
            emptyFallback: "HEAD",
          },
        },
        {
          id: "branch-to",
          placeholder: "main",
          label: "比較先",
          description:
            "比較先（省略時は比較元のみ、または作業ツリーとの差分）",
          requiresRadio: { group: "compare", id: "branches" },
        },
      ],
      pathspecs: [
        {
          id: "paths",
          label: "対象パス",
          description: "対象パスの指定（省略時はリポジトリ全体）",
          excludeSuggestions: [
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
          ],
        },
      ],
    },
  },

  // --- history ---
  {
    id: "log",
    category: "history",
    title: "ブランチ上のコミット履歴を確認する",
    emoji: "📜",
    command: {
      base: "git log",
      toggles: [
        {
          id: "oneline",
          flag: "--oneline",
          label: "1行表示",
          description: "コミット hash とメッセージを1行ずつ表示",
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
          description: "表示件数の上限（省略時は制限なし）",
        },
        {
          id: "path",
          placeholder: "-- src/app.ts",
          label: "パス指定",
          description: "特定ファイルの履歴のみ（省略時は全ファイル）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "show",
    category: "history",
    title: "指定コミットの差分やメタ情報を確認する",
    emoji: "🔬",
    command: {
      base: "git show",
      toggles: [
        {
          id: "stat",
          flag: "--stat",
          label: "統計のみ",
          description: "差分なしで変更ファイルの統計のみ",
        },
      ],
      texts: [
        {
          id: "rev",
          placeholder: "HEAD",
          label: "コミット",
          description: "コミット hash やブランチ名（省略時は HEAD）",
          suffix: true,
        },
      ],
    },
  },
  {
    id: "reflog",
    category: "history",
    title: "HEAD やブランチの移動履歴を確認する",
    emoji: "🧭",
    command: {
      base: "git reflog",
      toggles: [
        {
          id: "date-iso",
          flag: "--date=iso",
          label: "日時を表示",
          description: "各エントリに日時を付ける",
        },
      ],
      texts: [
        {
          id: "count",
          flag: "-n",
          placeholder: "20",
          label: "件数制限",
          description: "表示件数の上限（省略時は制限なし）",
        },
        {
          id: "ref",
          placeholder: "HEAD",
          label: "対象",
          description: "ブランチ名など（省略時は HEAD）",
          suffix: true,
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
