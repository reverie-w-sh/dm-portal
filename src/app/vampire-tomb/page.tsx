import Link from "next/link";
import type { Metadata } from "next";
import TombGuide from "./TombGuide";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Гробница вампиров: путь через мост и Зал костей",
  description: "Идём варить большую руну жизни, силы, брони или меткости: Логово, Кристальный зал, мост, Зал костей, ресурсы, шахматы и Алхимик. Маршрут со скриншотами.",
  alternates: { canonical: "/vampire-tomb" },
  openGraph: {
    title: "Гробница вампиров: маршрут со скриншотами",
    description: "Путь к большой руне жизни, силы, брони или меткости: ключ, болты, баллиста, грибница, шахматы и Алхимик.",
    url: "/vampire-tomb",
    locale: "ru_RU",
    type: "article",
    images: [{ url: "/images/vampire-tomb/01.jpg", width: 880, height: 434, type: "image/jpeg", alt: "Вход в Гробницу вампиров в Древнем Мире" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/vampire-tomb/01.jpg"] },
};

export default function VampireTombPage() {
  return (
    <main className={styles.page}>
      <article className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Навигационная цепочка">
          <Link href="/world">Карта мира</Link><span aria-hidden="true">/</span>
          <Link href="/world/vampire-tomb">Гробница вампиров</Link><span aria-hidden="true">/</span>
          <span>Прохождение</span>
        </nav>
        <header className={styles.header}>
          <p className={styles.kicker}>Древний Мир · маршрут по Гробнице</p>
          <h1>Гробница вампиров</h1>
          <p>Идём варить большую руну: жизни, силы, брони или меткости. От «Логова» через Зал костей к Котлу. С землеройками по дороге тоже познакомимся.</p>
        </header>
        <section className={styles.intro} aria-labelledby="intro-heading">
          <h2 id="intro-heading">Вступление</h2>
          <p>Привет!) Вполне вероятно, что ты новенький в нашем мире... и может так статься, что ты открывал инфы персонажей и видел у некоторых в графе «Увлечения и хобби» странные аббревиатуры ПМБ, ПМР, ПБР, МБР. Этот гайд даст ответ на вопрос - что же это такое))</p>
        </section>
        <TombGuide />
        <nav className={styles.bottomLinks} aria-label="Другие полезные страницы">
          <Link href="/world?from=home&to=vampire-tomb#world-route">Как добраться до Гробницы на карте мира</Link>
          <Link href="/crafting-guide">Кожевничество и заклинательство</Link>
        </nav>
      </article>
    </main>
  );
}
