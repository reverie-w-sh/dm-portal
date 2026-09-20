import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findWorldRoute,
  getNeighbours,
  LOCATION_BY_ID,
  LOCATION_BY_SLUG,
  WORLD_LOCATIONS,
} from "@/lib/world-map";
import styles from "./page.module.css";

type LocationPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return WORLD_LOCATIONS.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = LOCATION_BY_SLUG.get(slug);
  if (!location) return {};
  return {
    title: `${location.name} — как добраться`,
    description: `${location.description} Маршрут из Дома и переходы в соседние локации игры Древний Мир.`,
    alternates: { canonical: `/world/${location.slug}` },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = LOCATION_BY_SLUG.get(slug);
  if (!location) notFound();

  const route = findWorldRoute("home", location.id);
  const neighbours = getNeighbours(location.id);

  return (
    <main className={styles.page}>
      <article className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/world">Карта мира</Link>
          <span aria-hidden="true">/</span>
          <span>{location.name}</span>
        </nav>

        <header className={styles.header}>
          <p>Локация Древнего Мира</p>
          <h1>{location.name}</h1>
          <span>{location.description}</span>
        </header>

        {location.image && (
          <div className={styles.screenshot}>
            <Image
              src={location.image}
              alt={`Игровой экран: ${location.name}`}
              width={1200}
              height={680}
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
            />
          </div>
        )}

        <div className={styles.columns}>
          <section className={styles.card}>
            <p className={styles.eyebrow}>От Дома</p>
            <h2>Как добраться</h2>
            {location.id === "home" ? (
              <p className={styles.empty}>Ты уже дома 😊</p>
            ) : (
              <ol className={styles.steps}>
                {route.map((step, index) => (
                  <li key={`${step.from}-${step.to}`}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{LOCATION_BY_ID.get(step.to)?.name}</strong>
                      <p>{step.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <Link href={`/world?from=home&to=${location.id}#world-route`} className={styles.mapButton}>
              Показать на общей карте
            </Link>
          </section>

          <aside className={styles.card}>
            <p className={styles.eyebrow}>Переходы</p>
            <h2>Куда можно пройти</h2>
            <div className={styles.neighbours}>
              {neighbours.map((item) => (
                <Link key={item.id} href={`/world/${item.slug}`}>
                  <span>{item.name}</span>
                  <b aria-hidden="true">→</b>
                </Link>
              ))}
            </div>
            {location.guideHref && (
              <Link href={location.guideHref} className={styles.guideButton}>
                {location.guideLabel || "Открыть гайд"}
              </Link>
            )}
          </aside>
        </div>
      </article>
    </main>
  );
}
