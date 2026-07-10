import Link from "next/link";

export default function LinksPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-ink tracking-tight mb-2">
        Полезное
      </h1>

      <div className="divider-accent mb-10" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dom-boli"
          className="glass rounded-2xl p-8 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,.15)]"
        >
          <div className="text-5xl mb-5">🗺️</div>

          <h2 className="text-xl font-bold text-ink mb-2">
            Карты Дома Боли (КП)
          </h2>

          <p className="text-ink-muted text-sm">
            Все 6 карт Кровавого Подземелья.
          </p>
        </Link>

        <Link
          href="/personal-smiles"
          className="glass rounded-2xl p-8 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,.15)]"
        >
          <div className="text-5xl mb-5">😄</div>

          <h2 className="text-xl font-bold text-ink mb-2">
            Рейтинг особистих смайликів
          </h2>

          <p className="text-ink-muted text-sm">
            У кого найбільша особиста колекція
          </p>
        </Link>
      </div>
    </div>
  );
}
