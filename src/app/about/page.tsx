import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const NEMETS_PROFILE =
  "https://dm-game.com/index.php?file=infouser&cuid=17507";
const LEN_PROFILE =
  "https://dm-game.com/index.php?file=infouser&cuid=4441";

function GoldenPaw() {
  return (
    <span className={styles.paw} aria-hidden="true">
      <i className={styles.toe1} />
      <i className={styles.toe2} />
      <i className={styles.toe3} />
      <i className={styles.toe4} />
      <i className={styles.pad} />
    </span>
  );
}

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.heading}>
          <div className={styles.titleRow}>
            <span className={styles.titleLine} aria-hidden="true" />
            <h1>О клане</h1>
            <span className={styles.titleLine} aria-hidden="true" />
          </div>
          <div className={styles.titleOrnament} aria-hidden="true">
            <span />
            <GoldenPaw />
            <span />
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.visual}>
            <Image
              src="/images/about/history-emblem.webp"
              alt=""
              width={170}
              height={170}
              priority
            />
          </div>

          <p className={styles.story}>
            Клан создан <strong>15.06.2026.</strong> Началось все с триумфального
            возвращения Шпиля за несколько дней до этой даты... Это длинная
            история. Когда-нибудь я тебе её расскажу, если захочешь ;)
          </p>
        </section>

        <section className={`${styles.panel} ${styles.recruitmentPanel}`}>
          <div className={styles.visual}>
            <Image
              src="/images/about/recruitment-book.webp"
              alt=""
              width={185}
              height={210}
            />
          </div>

          <div className={styles.content}>
            <h2>Приём в клан</h2>
            <div className={styles.subOrnament} aria-hidden="true">
              <span />
              <GoldenPaw />
              <span />
            </div>

            <div className={styles.text}>
              <p>
                Приём в клан открыт через постель{" "}
                <a href={NEMETS_PROFILE} target="_blank" rel="noreferrer">
                  Немца
                </a>
                .
              </p>
              <p>До постели!</p>
              <p>Тебе необходимо сделать следующее:</p>
              <ul>
                <li>
                  занести в отдел <Link href="/clans/278">«Свои»</Link> медкнижку
                  об отсутствии блох, глистов и наличии всех прививок, в т.ч.
                  прививка от бешенства.
                </li>
                <li>
                  Обращаться к{" "}
                  <a href={LEN_PROFILE} target="_blank" rel="noreferrer">
                    Лень
                  </a>{" "}
                  для дальнейшего инструктажа.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
