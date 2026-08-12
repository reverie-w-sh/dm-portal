import Link from "next/link";
import { GIFTS } from "@/data/gifts";
import collectionStyles from "../collection-pages.module.css";
import styles from "./page.module.css";

export default function GiftsPage() {
  return (
    <main className={collectionStyles.page}>
      <section className={collectionStyles.shell}>
        <header className={collectionStyles.hero}>
          <div className={`${collectionStyles.heroIcon} ${styles.heroGiftIcon}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/gifts/gift-page-150.png" alt="" />
          </div>
          <div>
            <h1>Подарки</h1>
            <p className={collectionStyles.heroDescription}>
              Сначала тут были только клановые подарочки с волчатами для Волчат🐺. Но потом меня попросили добавить и другие картинки из интернета. Я привела их к нужному подарочковому размеру, так что можешь брать любую понравившуюся и дарить :) Только личные не трогай, там и так будет понятно, какие именно.
            </p>
          </div>
        </header>

        <div className={styles.boardCallout}>
          <div>
            <strong>Хочешь выложить рисунок подарками?</strong>
            <span>Сначала собери его на планшете теми же подарками, что есть здесь.</span>
          </div>
          <Link href="/gift-board" className={styles.boardButton}>
            Планшет подарков →
          </Link>
        </div>

        <section className={styles.instructions}>
          <div className={styles.instructionsText}>
            <h2>Как заказать подарок</h2>
            <ol>
              <li>Скачай понравившийся подарок на этой странице.</li>
              <li>
                Загрузи его в игре:
                <ul>
                  <li>
                    Перейди в раздел{" "}
                    <a
                      href="https://dm-game.com/index.php?file=com_otdel&mode=PresentSelf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Услуги комотдела → Личные подарки
                    </a>
                  </li>
                  <li>
                    Проверь, чтобы на счету было не меньше <strong>3 ТГ</strong>.
                  </li>
                  <li>
                    Подготовь картинку размером <strong>60×60 px</strong>.
                  </li>
                  <li>
                    Загрузи подарок, впиши название и сохрани. Потом нажми «Выдать 35 шт.»
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/gifts/wolf-clan-gift-page.png"
            alt="Волчонок с подарком"
            className={styles.instructionsWolf}
          />
        </section>

        <div className={styles.grid}>
          {GIFTS.map((gift) => (
            <article key={gift.file} className={styles.card}>
              <div className={styles.visual}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gift.file} alt={gift.title} loading="lazy" />
              </div>

              {gift.personal ? (
                <button type="button" disabled className={styles.privateButton}>
                  Личный подарок, его не скачивай :)
                </button>
              ) : (
                <a href={gift.file} download className={styles.downloadButton}>
                  ⬇ Скачать
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
