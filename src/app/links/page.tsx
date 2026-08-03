import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const usefulLinks = [
  {
    href: "/dom-boli",
    image: "/images/links/dom-boli.webp",
    alt: "Карты Дома Боли",
  },
  {
    href: "/personal-smiles",
    image: "/images/links/personal-smiles.webp",
    alt: "Личные смайлики",
  },
  {
    href: "/hunter-board",
    image: "/images/links/hunter-board.webp",
    alt: "Планшет охотника",
  },
  {
    href: "/dungeons",
    image: "/images/links/dungeons.webp",
    alt: "Карты подземелий",
  },
  {
    href: "/ratings",
    image: "/images/links/ratings.webp",
    alt: "Рейтинги",
  },
  {
    href: "/experience",
    image: "/images/links/experience.webp",
    alt: "Калькулятор опыта",
  },
  {
    href: "/personal-items",
    image: "/images/links/personal-items.webp",
    alt: "Именные вещи",
  },
  {
    href: "/couples",
    image: "/images/links/couples.webp",
    alt: "Семейные пары",
  },
];

export default function LinksPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.heading}>
          <div className={styles.titleRow}>
            <span aria-hidden="true" />
            <h1>Полезное и не очень :)</h1>
            <span aria-hidden="true" />
          </div>
          <div className={styles.ornament} aria-hidden="true">
            <span />
            <Image
              src="/icons/wolf-paw-gold.png"
              alt=""
              width={22}
              height={22}
            />
            <span />
          </div>
          <div className={styles.intro}>
            <p>
              Карты, коллекции и другие материалы, которые могут пригодиться в
              игре.
            </p>
            <p>А могут и не пригодиться :)</p>
          </div>
        </header>

        <nav className={styles.grid} aria-label="Полезные разделы сайта">
          {usefulLinks.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.card}
              aria-label={item.alt}
            >
              <span className={styles.imageWrap}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 780px) 100vw, 50vw"
                  className={styles.image}
                />
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
