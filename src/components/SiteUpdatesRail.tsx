import Link from "next/link";
import styles from "./SiteUpdatesRail.module.css";

const updates = [
  {
    href: "/world/cave-road",
    title: "Пазлы в дороге",
    description: "В дороге теперь можно собирать пазлы. Заходи попробовать.",
  },
  {
    href: "/crafting-guide",
    title: "ЗЧ и заплатки",
    description: "Списки нужных ресурсов. Таблицы сравнения характеристик вещей.",
  },
  {
    href: "/vampire-tomb",
    title: "Гробница Вампиров",
    description: <>От Входа и до Котла. Маршрут, рецепты, список <s>покупок</s> необходимого, скрины всего, что там есть.</>,
  },
];

export default function SiteUpdatesRail() {
  return (
    <aside className={`${styles.rail} site-updates-rail`} aria-labelledby="site-updates-title">
      <div className={styles.heading}>
        <h2 id="site-updates-title">Новое на сайте</h2>
      </div>
      <ul className={styles.list}>
        {updates.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.card}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <small>Смотреть →</small>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
