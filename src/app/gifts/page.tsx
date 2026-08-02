import collectionStyles from "../collection-pages.module.css";
import styles from "./page.module.css";

export default function GiftsPage() {
  const gifts = [
    { title: "Ауф! Подарок", file: "/gifts/auf.gif" },
    { title: "Волчара Подарок", file: "/gifts/wolf.gif" },
    { title: "Волк-одиночка Подарок", file: "/gifts/lone-wolf.gif" },
    { title: "Вою на луну Подарок", file: "/gifts/moon.gif" },
    { title: "Оборотень Подарок", file: "/gifts/werewolf.gif" },
    { title: "Любовь у волков Подарок", file: "/gifts/love.gif" },
    { title: "Лес Подарок", file: "/gifts/forest.png" },
    { title: "Лапка 1 Подарок", file: "/gifts/lapka.gif" },
    { title: "Обнимашки Подарок", file: "/gifts/hug1.gif" },
    { title: "Обнимашки 2 Подарок", file: "/gifts/hug2.gif" },
    { title: "Любовь и Волчата Подарок", file: "/gifts/hug3.gif" },
    { title: "Любовь у Волчат Подарок", file: "/gifts/hug4.gif" },
    { title: "Лапка Подарок", file: "/gifts/lapka-fire-g.gif" },
    { title: "Лапка 2 Подарок", file: "/gifts/auf-g.gif" },
    { title: "Лапка 3 Подарок", file: "/gifts/gerb.gif" },
    { title: "Черно-Белый волк Подарок", file: "/gifts/wolf-g.gif" },
    { title: "Волчонок 1 Подарок", file: "/gifts/wolfchen.gif" },
    { title: "Волчонок Подарок", file: "/gifts/wolfchen-2-g.gif" },
    { title: "Волчица Подарок", file: "/gifts/Volchisa.gif" },
    { title: "Magic Wolf Подарок", file: "/gifts/MagicWolf.gif" },
    { title: "Кофе Волчонок 1 Подарок", file: "/gifts/coffee.gif" },
    { title: "Кофе Волчонок 2 Подарок", file: "/gifts/coffee1.gif", personal: true },
    { title: "Кофе Волчонок 3 Подарок", file: "/gifts/coffee2.gif", personal: true },
    { title: "Кофе Томми 4 Подарок", file: "/gifts/coffee-tommy.gif", personal: true },
    { title: "Обнимашки Подарок)", file: "/gifts/hug.gif" },
    { title: "Лавочка с попкорном Подарок)", file: "/gifts/lavochka.gif" },
    { title: "Волчица Лени Подарок)", file: "/gifts/len-g.gif" },
    { title: "Волчонок-чеширский котик Подарок)", file: "/gifts/wolf-chechir-gift.gif" },
    { title: "Котик пчелка Подарок)", file: "/gifts/2.gif" },
    { title: "Собака зубастый Подарок)", file: "/gifts/3.gif" },
    { title: "Котик милый Подарок)", file: "/gifts/4.gif" },
    { title: "Пёсель с пивом Подарок)", file: "/gifts/5.gif" },
    { title: "День Рождения 1 Подарок)", file: "/gifts/happy-birthday-1.gif" },
    { title: "День Рождения 2 Подарок)", file: "/gifts/happy-birthday-2.gif" },
    { title: "День Рождения 3 Подарок)", file: "/gifts/happy-birthday-3.gif" },
    { title: "День Рождения 4 Подарок)", file: "/gifts/happy-birthday-4.gif" },
    { title: "Глазастый котик 1 Подарок)", file: "/gifts/cat-1.gif" },
    { title: "Глазастый котик 2 Подарок)", file: "/gifts/cat-2.gif" },
    { title: "Глазастый котик 3 Подарок)", file: "/gifts/cat-3.gif" },
    { title: "Глазастый котик 4 Подарок)", file: "/gifts/cat-4.gif" },
    { title: "Котик на ручках Подарок)", file: "/gifts/kot-4.gif" },
    { title: "Любовь 1 Подарок)", file: "/gifts/love-1.gif" },
    { title: "Любовь 2 Подарок)", file: "/gifts/love-2.gif" },
    { title: "Волк 1 Подарок)", file: "/gifts/volk-1.gif" },
  ];

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
          {gifts.map((gift) => (
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
