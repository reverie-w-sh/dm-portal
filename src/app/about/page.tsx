import Link from "next/link";
import styles from "./page.module.css";

const NEMETS_PROFILE =
  "https://dm-game.com/index.php?file=infouser&cuid=17507";
const LEN_PROFILE =
  "https://dm-game.com/index.php?file=infouser&cuid=4441";

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerIcon} aria-hidden="true">
            🐾
          </div>
          <div>
            <h1>О клане</h1>
          </div>
        </header>

        <section className={styles.card}>
          <p className={styles.story}>
            Клан создан 15.06.2026. Началось все с триумфального возвращения
            Шпиля за несколько дней до этой даты... Это длинная история.
            Когда-нибудь я тебе её расскажу, если захочешь ;)
          </p>
        </section>

        <section className={styles.card}>
          <h2>Приём в клан</h2>

          <div className={styles.text}>
            <p>
              Приём в клан открыт через постель{" "}
              <a href={NEMETS_PROFILE} target="_blank" rel="noreferrer">
                Немца
              </a>
              .
            </p>

            <p className={styles.emphasis}>До постели!</p>

            <p>Тебе необходимо сделать следующее:</p>

            <ul>
              <li>
                занести в отдел{" "}
                <Link href="/alliances">«Свои»</Link> медкнижку об отсутствии
                блох, глистов и наличии всех прививок, в том числе прививки от
                бешенства;
              </li>
              <li>
                обратиться к{" "}
                <a href={LEN_PROFILE} target="_blank" rel="noreferrer">
                  Лень
                </a>{" "}
                для дальнейшего инструктажа.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
