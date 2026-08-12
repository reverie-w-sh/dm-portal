import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

const footerLinks = [
  { href: "/about", label: "О клане die Wölfchen" },
  { href: "/members", label: "Волчата" },
  { href: "/clans", label: "Все кланы" },
  { href: "/gifts", label: "Подарочки" },
  { href: "/links", label: "Библиотека" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.texture} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.line} />
          <Link href="/" title="На главную" className={styles.pawLink}>
            <Image
              src="/images/footer/wire-wolf-paw.png"
              alt=""
              width={1254}
              height={1254}
              className={styles.paw}
            />
          </Link>
          <span className={styles.line} />
        </div>

        <nav className={styles.nav} aria-label="Навигация в подвале сайта">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <p className={styles.copyright}>♥ 2026 © A&amp;W ♥</p>
      </div>
    </footer>
  );
}
