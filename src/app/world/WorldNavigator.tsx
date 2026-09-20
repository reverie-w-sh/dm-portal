"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  findWorldRoute,
  LOCATION_BY_ID,
  WORLD_LOCATIONS,
} from "@/lib/world-map";
import styles from "./page.module.css";

const MAP_LOCATIONS = WORLD_LOCATIONS.filter((location) => location.mapPoint);

type WorldNavigatorProps = {
  initialFrom?: string;
  initialTo?: string;
};

export default function WorldNavigator({ initialFrom, initialTo }: WorldNavigatorProps) {
  const [from, setFrom] = useState(
    initialFrom && LOCATION_BY_ID.has(initialFrom) ? initialFrom : "home",
  );
  const [to, setTo] = useState(
    initialTo && LOCATION_BY_ID.has(initialTo) ? initialTo : "hunting",
  );
  const [zoom, setZoom] = useState(1);

  const route = useMemo(() => findWorldRoute(from, to), [from, to]);
  const routeIds = useMemo(
    () => new Set([from, ...route.map((step) => step.to)]),
    [from, route],
  );
  const destination = LOCATION_BY_ID.get(to);
  const origin = LOCATION_BY_ID.get(from);

  function selectDestination(id: string) {
    setTo(id);
    document.getElementById("world-route")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <>
      <section className={styles.navigator} aria-labelledby="navigator-title">
        <div className={styles.navigatorHeading}>
          <div>
            <p className={styles.eyebrow}>Навигатор для новичков</p>
            <h2 id="navigator-title">Как пройти?</h2>
          </div>
          <div className={styles.selectors}>
            <label>
              <span>Я нахожусь</span>
              <select value={from} onChange={(event) => setFrom(event.target.value)}>
                {WORLD_LOCATIONS.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </label>
            <span className={styles.arrow} aria-hidden="true">→</span>
            <label>
              <span>Хочу попасть</span>
              <select value={to} onChange={(event) => setTo(event.target.value)}>
                {WORLD_LOCATIONS.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={styles.mapToolbar}>
          <span>Нажми на название локации, чтобы построить маршрут</span>
          <div className={styles.zoomButtons} aria-label="Масштаб карты">
            <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.2))} disabled={zoom <= 1} aria-label="Уменьшить карту">−</button>
            <button type="button" onClick={() => setZoom((value) => Math.min(1.6, value + 0.2))} disabled={zoom >= 1.6} aria-label="Увеличить карту">+</button>
          </div>
        </div>

        <div className={styles.mapViewport}>
          <div className={styles.mapCanvas} style={{ width: `${Math.round(100 * zoom)}%` }}>
            <Image
              src="/images/world/world-map.webp"
              alt="Карта мира игры Древний Мир: пустыня, дорога к озеру, город и Серая Пещера"
              width={1672}
              height={941}
              priority
              sizes="(max-width: 800px) 1100px, 1500px"
              className={styles.mapImage}
            />
            {MAP_LOCATIONS.map((location) => {
              const point = location.mapPoint!;
              const active = location.id === to;
              const onRoute = routeIds.has(location.id);
              return (
                <button
                  key={location.id}
                  type="button"
                  className={`${styles.pin} ${active ? styles.pinActive : ""} ${onRoute ? styles.pinRoute : ""}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => selectDestination(location.id)}
                  aria-pressed={active}
                >
                  <span className={styles.pinDot} aria-hidden="true" />
                  <span>{location.shortName || location.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="world-route" className={styles.routeCard} aria-live="polite">
        <div className={styles.routeTop}>
          <div>
            <p className={styles.eyebrow}>Маршрут</p>
            <h2>{origin?.name} <span>→</span> {destination?.name}</h2>
          </div>
          {destination && <Link href={`/world/${destination.slug}`} className={styles.detailsButton}>О локации</Link>}
        </div>

        {from === to ? (
          <p className={styles.arrived}>Ты уже здесь 😊</p>
        ) : route.length ? (
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
        ) : (
          <p className={styles.arrived}>Для этого перехода маршрут пока не записан.</p>
        )}

        {destination?.guideHref && (
          <Link href={destination.guideHref} className={styles.guideButton}>
            {destination.guideLabel || "Открыть гайд"}
          </Link>
        )}
      </section>

      <section className={styles.catalogue}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Все точки мира</p>
          <h2>Локации и полезные места</h2>
        </div>
        <div className={styles.locationGrid}>
          {WORLD_LOCATIONS.map((location) => (
            <article key={location.id} className={styles.locationCard}>
              <button type="button" onClick={() => selectDestination(location.id)}>
                <span>{location.name}</span>
                <small>Показать маршрут</small>
              </button>
              <Link href={`/world/${location.slug}`} aria-label={`Открыть страницу: ${location.name}`}>↗</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
