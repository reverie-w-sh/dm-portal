import Link from "next/link";
import { GIFTS } from "@/data/gifts";
import collectionStyles from "../collection-pages.module.css";
import styles from "./page.module.css";

export default function GiftsPage() {
  return (
    <main className={collectionStyles.page}>
      <section className={collectionStyles.shell}>
        <header className={collectionStyles.hero}>
          <div className={collectionStyles.heroIcon}>🎁</div>
          <div>
            <h1>Подарки</h1>
            <p className={collectionStyles.heroDescription}>
              Сначала тут были только клановые подарочки с волчатами для Волчат🐺. Но по многочисленной просьбе добавлены разные картинки из интернета, приведенные к нужному подарочковому размеру, которыми может воспользоваться каждый желающий) Дарите на здоровье)) кроме личных, их нельзя дарить, вы там поймете, о чем я)
            </p>
          </div>
        </header>

        <div className={styles.boardCallout}>
          <div>
            <strong>Хочешь выложить рисунок подарками?</strong>
            <span>Собери его сначала на планшете — теми же подарками, что здесь.</span>
          </div>
          <Link href="/gift-board" className={styles.boardButton}>
            Планшет подарков →
          </Link>
        </div>

        <section className={styles.instructions}>
          <h2>Как заказать подарок</h2>
          <ol>
            <li>Скачайте понравившийся подарок на этой странице.</li>
            <li>
              Загрузите его в игре:
              <ul>
                <li>
                  Перейдите в раздел{" "}
                  <a
                    href="https://dm-game.com/index.php?file=com_otdel&mode=PresentSelf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Услуги комотдела → Личные подарки
                  </a>
                </li>
                <li>
                  На вашем счету должно быть не менее <strong>3 ТГ</strong>.
                </li>
                <li>
                  Размер изображения должен быть <strong>60×60 px</strong>.
                </li>
                <li>
                  Загрузите подарок, впишите название, сохраните. Нажмите «Выдать 35 шт.»
                </li>
              </ul>
            </li>
          </ol>
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
                  Приватный, не надо его скачивать :)
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
