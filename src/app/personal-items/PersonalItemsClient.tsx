"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "../collection-pages.module.css";

type Item = { id: string; name: string; owner: string; ownerLevel?: number; imageUrl: string; itemUrl: string };
type Player = { profileUrl?: string; clanId?: string; clanName?: string; level?: number };
type Sort = "count" | "owner";
export default function PersonalItemsClient({ data, directory }: { data: { updatedAt?: string; items: Item[] }; directory: Record<string, Player> }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("count");
  useEffect(() => {
    const owner = new URLSearchParams(window.location.search).get("owner");
    if (owner) setQuery(owner);
  }, []);
  const groups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("ru");
    const map = new Map<string, Item[]>();
    for (const item of data.items) {
      if (q && !item.owner.toLocaleLowerCase("ru").includes(q) && !item.name.toLocaleLowerCase("ru").includes(q)) continue;
      const list = map.get(item.owner) || []; list.push(item); map.set(item.owner, list);
    }
    return [...map.entries()].sort((a,b) => sort === "count" ? b[1].length-a[1].length || a[0].localeCompare(b[0],"ru") : a[0].localeCompare(b[0],"ru"));
  }, [data.items, query, sort]);
  return <main className={styles.page}>
    <section className={styles.shell}>
      <header className={styles.hero}><div className={styles.heroIcon}>⚔️</div><div><p className={styles.eyebrow}>Уникальные картинки</p><h1>Именные вещи</h1><p>На этой страничке можно увидеть все персональные изображения на оружие и амуницию, что есть в игре.</p></div></header>
      <div className={styles.stats}><span><b>{data.items.length}</b> вещей</span><span><b>{groups.length}</b> владельцев</span></div>
      <div className={styles.controls}><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Найти персонажа или вещь…"/><div><button className={sort==="count"?styles.active:""} onClick={()=>setSort("count")}>По количеству</button><button className={sort==="owner"?styles.active:""} onClick={()=>setSort("owner")}>По нику</button></div></div>
      {groups.length ? <div className={styles.groups}>{groups.map(([owner, items]) => { const p=directory[owner.toLocaleLowerCase("ru")]; return <article className={styles.group} key={owner} id={`owner-${encodeURIComponent(owner)}`}><div className={styles.groupHead}><div><p className={styles.mini}>Владелец коллекции</p><h2>{p?.profileUrl?<a href={p.profileUrl} target="_blank" rel="noreferrer">{owner}</a>:owner} <small>[{p?.level ?? items[0]?.ownerLevel ?? "?"}]</small></h2><p>{p?.clanName || "Без клана"}</p></div><strong>{items.length} {items.length===1?"вещь":"вещей"}</strong></div><div className={styles.itemGrid}>{items.map(item=><a className={styles.itemCard} href={item.itemUrl} target="_blank" rel="noreferrer" key={item.id}>{item.imageUrl?<img src={item.imageUrl} alt="" loading="lazy"/>:<span className={styles.itemFallback}>⚔️</span>}<span>{item.name}</span></a>)}</div></article>})}</div>:<div className={styles.empty}>Именные вещи пока не загружены. После следующей синхронизации здесь появятся коллекции.</div>}
      {data.updatedAt && <p className={styles.updated}>Обновлено: {new Date(data.updatedAt).toLocaleString("ru-RU")}</p>}
    </section>
  </main>;
}
