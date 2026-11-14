import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Глобус" },
  { to: "/lab", label: "Лаборатория" },
  { to: "/achievements", label: "Достижения" },
  { to: "/methodology", label: "Методика" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="TWO FUTURES — на главную">
          <span className="relative flex h-6 w-6 items-center justify-center" aria-hidden>
            <span className="absolute h-6 w-6 rounded-full border border-coop/80 -translate-x-1" />
            <span className="absolute h-6 w-6 rounded-full border border-conf/80 translate-x-1" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-semibold tracking-wide">TWO FUTURES</span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">ДВА БУДУЩИХ</span>
          </span>
        </Link>
        <nav className="-mr-2 flex flex-1 justify-end gap-1 overflow-x-auto" aria-label="Разделы">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}