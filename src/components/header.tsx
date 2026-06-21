import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-stone-900">
          Stockpedia
          <span className="ml-1 text-sm font-normal text-stone-400">KR</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/market"
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            시장
          </Link>
          <Link
            href="/screener"
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            스크리너
          </Link>
          <Link
            href="/portfolio"
            className="text-stone-600 transition-colors hover:text-stone-900"
          >
            포트폴리오
          </Link>
        </nav>
      </div>
    </header>
  );
}
