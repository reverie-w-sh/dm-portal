"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "../collection-pages.module.css";

type Item = {
  id: string;
  name: string;
  owner: string;
  ownerLevel?: number;
  imageUrl: string;
  itemUrl: string;
};

type Player = {
  cuid?: string;
  profileUrl?: string;
  clanId?: string;
  clanName?: string;
  level?: number;
};

type DisplayItem = Item & { quantity: number };
type OwnerGroup = {
  owner: string;
  items: DisplayItem[];
  totalCount: number;
};
type Sort = "count-desc" | "count-asc" | "owner";

function mergeIdenticalItems(items: Item[]): DisplayItem[] {
  const merged = new Map<string, DisplayItem>();

  for (const item of items) {
    // Одинаковое название с другой картинкой — это другая вещь.
    const key = `${item.name.trim().toLocaleLowerCase("ru")}\u0000${item.imageUrl}`;
    const existing = merged.get(key);

    if (existing) {
      existing.quantity += 1;
    } else {
      merged.set(key, { ...item, quantity: 1 });
    }
  }

  return [...merged.values()];
}

export default function PersonalItemsClient({
  data,
  directory,
}: {
  data: { updatedAt?: string; items: Item[] };
  directory: Record<string, Player>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("count-desc");

  useEffect(() => {
    const owner = new URLSearchParams(window.location.search).get("owner");
    if (owner) setQuery(owner);
  }, []);

  function clearQuery() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  const groups = useMemo<OwnerGroup[]>(() => {
    const q = query.trim().toLocaleLowerCase("ru");
    const byOwner = new Map<string, Item[]>();

    for (const item of data.items) {
      if (
        q &&
        !item.owner.toLocaleLowerCase("ru").includes(q) &&
        !item.name.toLocaleLowerCase("ru").includes(q)
      ) {
        continue;
      }

      const list = byOwner.get(item.owner) ?? [];
      list.push(item);
      byOwner.set(item.owner, list);
    }

    return [...byOwner.entries()]
      .map(([owner, items]) => ({
        owner,
        totalCount: items.length,
        items: mergeIdenticalItems(items),
      }))
      .sort((a, b) => {
        if (sort === "owner") return a.owner.localeCompare(b.owner, "ru");

        const difference =
          sort === "count-desc"
            ? b.totalCount - a.totalCount
            : a.totalCount - b.totalCount;

        return difference || a.owner.localeCompare(b.owner, "ru");
      });
  }, [data.items, query, sort]);

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.heroIcon}>⚔️</div>
          <div>
            <p className={styles.eyebrow}>Уникальные картинки</p>
            <h1>Именные вещи</h1>
            <p>
              На этой страничке можно увидеть все персональные изображения на
              оружие и амуницию, что есть в игре...
              <br />
              Ну как все. Смотрим на "заколдованные" вещички :) 
            </p>
          </div>
        </header>

        <div className={styles.stats}>
          <span>
            <b>{data.items.length}</b> вещей
          </span>
          <span>
            <b>{groups.length}</b> владельцев
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти персонажа или вещь…"
            />
            {query && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={clearQuery}
                aria-label="Очистить поиск"
                title="Очистить поиск"
              >
                ×
              </button>
            )}
          </div>
          <div>
            <button
              className={sort !== "owner" ? styles.active : ""}
              onClick={() =>
                setSort((current) =>
                  current === "count-desc" ? "count-asc" : "count-desc",
                )
              }
            >
              {sort === "count-asc" ? "Меньше вещей ▲" : "Больше вещей ▼"}
            </button>
            <button
              className={sort === "owner" ? styles.active : ""}
              onClick={() => setSort("owner")}
            >
              По нику
            </button>
          </div>
        </div>

        {groups.length ? (
          <div className={styles.groups}>
            {groups.map(({ owner, items, totalCount }) => {
              const player = directory[owner.toLocaleLowerCase("ru")];

              return (
                <article
                  className={styles.group}
                  key={owner}
                  id={`owner-${encodeURIComponent(owner)}`}
                >
                  <div className={styles.groupHead}>
                    <div>
                      <p className={styles.mini}>Владелец коллекции</p>
                      <h2>
                        {player?.profileUrl ? (
                          <a
                            href={player.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {owner}
                          </a>
                        ) : (
                          owner
                        )}{" "}
                        <small>
                          [{player?.level ?? items[0]?.ownerLevel ?? "?"}]
                        </small>
                      </h2>
                      <p>{player?.clanName || "Без клана"}</p>
                    </div>
                    <div className={styles.groupActions}>
                      {player?.cuid && (
                        <a
                          className={styles.collectionLink}
                          href={`/personal-smiles?player=${encodeURIComponent(player.cuid)}`}
                        >
                          🙂 Личные смайлики
                        </a>
                      )}
                      <strong>
                        {totalCount} {totalCount === 1 ? "вещь" : "вещей"}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.itemGrid}>
                    {items.map((item) => (
                      <a
                        className={styles.itemCard}
                        href={item.itemUrl}
                        target="_blank"
                        rel="noreferrer"
                        key={`${item.name}-${item.imageUrl}`}
                      >
                        <span className={styles.itemVisual}>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              loading="lazy"
                            />
                          ) : (
                            <span className={styles.itemFallback}>⚔️</span>
                          )}
                          {item.quantity > 1 && (
                            <strong className={styles.itemQuantity}>
                              ×{item.quantity}
                            </strong>
                          )}
                        </span>
                        <span>{item.name}</span>
                      </a>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            Именные вещи пока не загружены. После следующей синхронизации здесь
            появятся коллекции.
          </div>
        )}

        {data.updatedAt && (
          <p className={styles.updated}>
            Обновлено: {new Date(data.updatedAt).toLocaleString("ru-RU")}
          </p>
        )}
      </section>
    </main>
  );
}
