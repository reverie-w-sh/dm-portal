import Image from "next/image";
import Link from "next/link";
import clansData from "../../data/clans.json";
import playersData from "../../data/players.json";
import PlayerRow from "@/components/PlayerRow";
import QuickSearch from "@/components/QuickSearch";

const OUR_CLAN_ID = "278";

const newsItems = [
  {
    id: 1,
    date: "10.06.2026",
    title: "Клан открыт для рекрутинга",
    body: "Принимаем активных игроков с уровнем от 60. Оставьте заявку лидеру клана в игре.",
  },
  {
    id: 2,
    date: "28.04.2026",
    title: "8 лет клану die Wölfchen!",
    body: "В этот день, 28 апреля 2018 года, была основана наша стая. Мы помним путь, по которому прошли.",
  },
  {
    id: 3,
    date: "15.03.2026",
    title: "Победа в недельном рейтинге",
    body: "Наш клан вошёл в топ-3 по итогам недели. Благодарим каждого участника за вклад.",
  },
];

export default function HomePage() {
  const ourClan = clansData.find((c) => c.clanId === OUR_CLAN_ID)!;
  const topMembers = playersData
    .filter((p) => ourClan.members.includes(p.cuid))
    .sort((a, b) => b.level - a.level)
    .slice(0, 3);

  return (
    <>
      {/* ═══════════════ HERO — full bleed ═══════════════ */}
      <section
        className="relative w-full overflow-hidden flex flex-col items-center justify-center"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {/* ── Split backgrounds ─────────────────────────── */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to right, #0c1a2e, #0b1220)" }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to left, #010306, #06090f)" }}
          aria-hidden
        />

        {/* ── White wolf — left side, facing center ────── */}
        <div
          className="absolute bottom-0 left-0 w-1/2 h-full pointer-events-none select-none"
          aria-hidden
          style={{ transform: "scaleX(-1)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wolves/white-wolf.svg"
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "left bottom",
              opacity: 0.32,
              filter: "brightness(3) saturate(0)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 70% 90% at 20% 55%, rgba(160,195,240,0.07) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* ── Dark wolf — right side, facing center ────── */}
        <div
          className="absolute bottom-0 right-0 w-1/2 h-full pointer-events-none select-none"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wolves/black-wolf.svg"
            alt=""
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right bottom",
              opacity: 0.4,
              filter: "brightness(0.5) saturate(0.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 70% 90% at 80% 55%, rgba(0,2,8,0.45) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* ── Center vertical glow line ─────────────────── */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(61,155,255,0.6) 25%, rgba(61,155,255,0.6) 75%, transparent 100%)",
          }}
          aria-hidden
        />

        {/* ── Blue radial glow at center ────────────────── */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(61,155,255,0.14) 0%, rgba(61,155,255,0.05) 40%, transparent 65%)",
          }}
          aria-hidden
        />

        {/* ── Center content ────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col items-center text-center gap-5 px-6 w-full"
          style={{ maxWidth: 700, margin: "0 auto", paddingTop: 40, paddingBottom: 40 }}
        >
          {/* Clan crest */}
          <div
            className="relative rounded-2xl overflow-hidden border border-white/15"
            style={{
              width: 144,
              height: 144,
              boxShadow:
                "0 0 48px rgba(61,155,255,0.35), 0 0 100px rgba(61,155,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          >
            <Image
              src="https://dm-game.com/pics/clanpic/clan_278_b.jpg"
              alt="die Wölfchen — герб клана"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          {/* Title */}
          <h1
            className="font-black tracking-tight leading-none"
            style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", color: "#ffffff" }}
          >
            die{" "}
            <span style={{ color: "#3d9bff" }}>Wölfchen</span>
          </h1>

          {/* Slogan */}
          <p
            className="font-medium tracking-[0.2em] uppercase"
            style={{
              fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
              color: "rgba(180,205,235,0.6)",
              letterSpacing: "0.22em",
            }}
          >
            Стая&nbsp;&middot;&nbsp;Честь&nbsp;&middot;&nbsp;Верность
          </p>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-wrap justify-center mt-1">
            <Link
              href="/members"
              className="btn-primary"
              style={{ padding: "0.7rem 1.8rem", fontSize: "0.9375rem" }}
            >
              Состав клана
            </Link>
            <Link
              href="/clans"
              className="btn-secondary glass glass-hover"
              style={{ padding: "0.7rem 1.8rem", fontSize: "0.9375rem" }}
            >
              Кланы и состав
            </Link>
          </div>

          {/* Stats strip — directly under buttons */}
          <div
            className="w-full mt-3 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="grid grid-cols-2">
              {[
                { label: "Участников", value: String(ourClan.membersCount) },
                { label: "Основан", value: ourClan.founded },
              ].map(({ label, value }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center py-5"
                  style={{
                    borderRight: i === 0 ? "1px solid rgba(255,255,255,0.07)" : undefined,
                  }}
                >
                  <span
                    className="font-black"
                    style={{ fontSize: "clamp(1.25rem, 3vw, 1.875rem)", color: "#3d9bff" }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[11px] font-medium mt-1 uppercase tracking-wider"
                    style={{ color: "rgba(139,157,184,0.7)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ color: "rgba(139,157,184,0.35)" }}
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════ CONTENT SECTIONS ════════════════ */}
      <div className="max-w-[1180px] mx-auto px-6 py-16 space-y-20">

        {/* О клане */}
        <section>
          <SectionHeader label="О нашем клане" />
          <div className="glass rounded-2xl p-8 sm:p-10 text-center">
            <div className="text-4xl mb-5">🐺</div>
            <p className="text-ink-dim leading-relaxed max-w-2xl mx-auto text-[15px]">
              {ourClan.description}
            </p>
            <Link
              href="/about"
              className="inline-block mt-6 text-accent text-sm font-medium hover:underline"
            >
              Подробнее о клане →
            </Link>
          </div>
        </section>

        {/* Лучшие участники */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-ink tracking-tight">
                Лучшие участники
              </h2>
              <div className="divider-accent mt-3" />
            </div>
            <Link
              href="/members"
              className="text-accent text-sm font-medium hover:underline mb-0.5"
            >
              Весь состав →
            </Link>
          </div>
          <div className="glass rounded-2xl p-5">
            {topMembers.map((p) => (
              <PlayerRow key={p.cuid} player={p} />
            ))}
          </div>
        </section>

        {/* Новости */}
        <section>
          <SectionHeader label="Новости клана" />
          <div className="space-y-3">
            {newsItems.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-5 sm:p-6">
                <div className="text-xs text-ink-muted font-medium mb-1">
                  {item.date}
                </div>
                <div className="font-semibold text-ink text-[15px] mb-1">
                  {item.title}
                </div>
                <p className="text-ink-dim text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Быстрый поиск */}
        <section>
          <SectionHeader label="Быстрый поиск персонажа" />
          <QuickSearch />
        </section>
      </div>
    </>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-ink tracking-tight">{label}</h2>
      <div className="divider-accent mt-3" />
    </div>
  );
}
