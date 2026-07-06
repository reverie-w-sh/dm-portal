import Link from "next/link";
import Image from "next/image";
import clansData from "../../../data/clans.json";

const OUR_CLAN_ID = "278";

const values = [
  {
    icon: "🐺",
    title: "Верность",
    text: "Стая сильна лишь своим единством. Мы стоим вместе — в победах и в поражениях. Нет места предательству.",
  },
  {
    icon: "⚔",
    title: "Честь",
    text: "Мы сражаемся честно. Никаких дешёвых трюков и оправданий. Только мастерство, стратегия и труд.",
  },
  {
    icon: "🌑",
    title: "Терпение",
    text: "Волк наблюдает, ждёт и наносит удар в нужный момент. Мы не торопимся — мы побеждаем наверняка.",
  },
  {
    icon: "🔥",
    title: "Рост",
    text: "Каждое поражение учит нас. Каждая победа поднимает планку. Мы всегда совершенствуемся.",
  },
];

export default function AboutPage() {
  const ourClan = clansData.find((c) => c.clanId === OUR_CLAN_ID)!;
  const winRate = Math.round((ourClan.wins / (ourClan.wins + ourClan.losses)) * 100);

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10"><div className="max-w-3xl mx-auto space-y-16">

      {/* Header */}
      <section className="text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-ink-muted mb-3">
          История клана
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-ink tracking-tight mb-4">
          О клане <span className="text-accent">die Wölfchen</span>
        </h1>
        <div className="divider-accent max-w-xs mx-auto mb-5" />
        <p className="text-ink-dim font-medium tracking-widest text-sm">
          {ourClan.slogan}
        </p>
      </section>

      {/* Crest + description */}
      <section className="glass rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <div className="relative w-40 h-40 shrink-0 rounded-2xl overflow-hidden crest-glow border border-white/10">
            <Image
              src="https://dm-game.com/pics/clanpic/clan_278_b.jpg"
              alt="die Wölfchen герб"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <p className="text-ink-dim leading-relaxed text-[15px]">
              {ourClan.description}
            </p>
            <div className="flex gap-6 mt-6 flex-wrap">
              {[
                { label: "Основан", value: ourClan.founded },
                { label: "Участников", value: ourClan.membersCount },
                { label: "Побед", value: ourClan.wins.toLocaleString("ru") },
                { label: "% побед", value: `${winRate}%` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-accent font-bold text-lg">{value}</div>
                  <div className="text-ink-muted text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-xl font-bold text-ink mb-2">Кодекс стаи</h2>
        <div className="divider-accent mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map(({ icon, title, text }) => (
            <div key={title} className="glass rounded-2xl p-6">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-bold text-ink text-[15px] mb-2">{title}</h3>
              <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join */}
      <section className="glass rounded-2xl p-10 text-center">
        <div className="text-4xl mb-4">🐺</div>
        <h2 className="text-xl font-bold text-ink mb-3">Вступить в стаю</h2>
        <div className="divider-accent max-w-xs mx-auto mb-5" />
        <p className="text-ink-dim text-sm max-w-md mx-auto leading-relaxed mb-6">
          Мы ищем активных игроков, разделяющих ценности нашего клана.
          Минимальный уровень: 60. Обратитесь к лидеру клана в игре.
        </p>
        <Link
          href="/members"
          className="inline-block btn-primary"
        >
          Познакомиться с составом
        </Link>
      </section>

    </div></div>
  );
}
