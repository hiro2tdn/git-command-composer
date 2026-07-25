import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <span className="text-2xl text-accent" aria-hidden>
            ⎇
          </span>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Git Command Composer
            </h1>
            <p className="text-xs text-muted">
              コマンドを選んでオプションを調整
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <AppShell />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Git Command Composer
      </footer>
    </>
  );
}
