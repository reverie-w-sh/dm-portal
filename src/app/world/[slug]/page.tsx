import type { Metadata } from "next";
import Link from "next/link";
import ScreenshotModal from "./ScreenshotModal";
import { notFound } from "next/navigation";
import {
  findWorldRoute,
  getNeighbours,
  LOCATION_BY_ID,
  LOCATION_BY_SLUG,
  WORLD_LOCATIONS,
} from "@/lib/world-map";
import styles from "./page.module.css";

type LocationPageProps = { params: Promise<{ slug: string }> };

type NaturalScreenshotProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

function NaturalScreenshot({ src, alt, priority = false }: NaturalScreenshotProps) {
  return <ScreenshotModal src={src} alt={alt} priority={priority} />;
}

export function generateStaticParams() {
  return WORLD_LOCATIONS.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = LOCATION_BY_SLUG.get(slug);
  if (!location) return {};
  return {
    title: `${location.name}: как добраться`,
    description: location.description
      ? `${location.description} Маршрут из Дома и переходы в соседние локации игры Древний Мир.`
      : `${location.name}. Маршрут из Дома и переходы в соседние локации игры Древний Мир.`,
    alternates: { canonical: `/world/${location.slug}` },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = LOCATION_BY_SLUG.get(slug);
  if (!location) notFound();

  const route = findWorldRoute("home", location.id);
  const neighbours = getNeighbours(location.id);

  return (
    <main className={styles.page}>
      <article className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/world">Карта мира</Link>
          <span aria-hidden="true">/</span>
          <span>{location.name}</span>
        </nav>

        <header className={styles.header}>
          <p>Локация Древнего Мира</p>
          <h1>{location.name}</h1>
          {location.description && <span>{location.description}</span>}
        </header>

        {location.image && (
          <div className={styles.screenshot}>
            <NaturalScreenshot
              src={location.image}
              alt={`Игровой экран: ${location.name}`}
              width={1200}
              height={680}
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
            />
          </div>
        )}

        {location.id === "memory-tree" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Квест локации</p>
            <h2>Как вырастить яблоко</h2>
            <p>
              Размести своё яблоко на дереве и удобряй его. Через 30 дней яблоко созреет.
            </p>
            <p className={styles.reward}>
              <strong>Награда:</strong> доступ к загрузке фотографий в галерею.
            </p>
            <ul>
              <li>Чтобы разместить яблоко, нажми на любую свободную область дерева.</li>
              <li>Чтобы удобрить яблоко, найди его на дереве. Оно отмечено жёлтым кругом. Нажми на яблоко, а затем на кнопку «Удобрить +24 часа…».</li>
              <li>За каждое удобрение взимается 1000 серебра.</li>
              <li>Если не удобрять яблоко три дня, оно сгниёт и исчезнет.</li>
            </ul>
            <p className={styles.goodLuck}>Желаем удачи!</p>
          </section>
        )}

        {location.id === "desert" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Собираем корм и путешествуем</p>
            <h2>Пустынь тут много. Очень много. Штук 20</h2>
            <p>
              Пустыня на самом деле не одна. Сначала попадаем в первую, название которой я не знаю, назовем просто 1я, а дальше начинается настоящее путешествие по пескам.
            </p>
            <div className={styles.nameCloud} aria-label="Список пустынь">
              {[
                "Первая пустыня", "Гоби", "Атакама", "Намиб", "Негев", "Калахари", "Белая пустыня", "Мохаве", "Вади-Рам", "Иудейская", "Тар", "Цветная пустыня", "Дюна Эфа", "Алёшковские пески", "Большой Западный Эрг", "Вахиба", "Пиннаклс", "Пустыня Древнего", "Пустыня Мечтателя", "Последняя"
              ].map((name) => <span key={name}>{name}</span>)}
            </div>

            <h3>Как всё устроено</h3>
            <ul>
              <li>Посещать Пустыню можно один раз в два часа.</li>
              <li>Между пустынями можно двигаться только в одну сторону, переходя из одной в следующую по очереди. Нажал на переход - возврата нет. Нажал случайно? можно успеть обновить страничку, пока идет отсчет</li>
              <li>Стрелка вправо не возвращает на предыдущую пустыню. Она полностью выводит из локации на Дорогу к озеру.</li>
            </ul>

            <h3>Как добывать корм</h3>
            <p>
              В обычное время в Пустыне можно собирать корм. Нажимаем на коробку и ждём 1 минуту 40 секунд, пока она откроется. После этого появляются три рыбки, которые почему-то называются кормом. Не спрашивайте, это ДМ )) Каждая рыбка собирается за 30 секунд.
            </p>
            <p className={styles.reward}>
              <strong>Для чего нужен корм:</strong> для крафта Посоха собирателя, который  сокращает время переходов в лесу, нужны 30 пива и 1000 корма. Для крафта Рогов гладиатора, которые позволяют убивать на 10-20 мобов больше установленного лимита, нужно 50 и 100 корма соотвественно.
            </p>

            <h3>Что происходит на Пасху</h3>
            <p>
              Во время пасхального события вместо коробок в Пустыне появляются корзинки с крашенками. Ими можно играть с Зайкой в таверне в «Камень, ножницы, бумага» (то есть в "Топор, кожа, железная руда") и выигрывать разнообразные призы. А если очень сильно повезёт, можно получить золотое яйцо 🥚✨, которое даст 5% опыта на целый год, медальку в инфе и завистливые взгляды окружающих (но это не точно)
            </p>
            <a className={styles.externalGuide} href="https://dm-game.com/guide/news.php?tid=5659" target="_blank" rel="noreferrer">
              Открыть описание пасхального события
            </a>

            <div className={styles.locationGallery}>
              {[
                ["/images/world/locations/desert-main.jpg", "Первая пустыня и переход дальше"],
                ["/images/world/locations/desert-more.jpg", "Одна из следующих пустынь"],
                ["/images/world/locations/desert-transition.jpg", "Переход в пустыню Атакама"],
                ["/images/world/locations/desert-last-transition.jpg", "Переход в Последнюю пустыню"],
                ["/images/world/locations/desert-last.jpg", "Последняя пустыня"],
                ["/images/world/locations/desert-box.jpg", "Коробка с кормом"],
                ["/images/world/locations/desert-food.jpg", "Три рыбки корма"],
                ["/images/world/locations/desert-gathering.jpg", "Сбор корма"],
              ].map(([src, alt]) => (
                <figure key={src}>
                  <NaturalScreenshot src={src} alt={alt} width={1000} height={600} sizes="(max-width: 780px) 100vw, 520px" />
                  <figcaption>{alt}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {location.id === "lake" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Ловим рыбку</p>
            <h2>Рыбалка на обычном Озере</h2>
            <p>
              Рыбачить на Озере можно один раз в 30 минут. Сама рыбалка длится до 10 минут. Нужно дождаться момента, когда надпись «Подсечь» на кнопке станет жёлтой и вовремя нажать на эту кнопку.
            </p>
            <p>
              Если включены системные оповещения, игра подаст звуковой сигнал. 
            </p>

            <h3>Какие бывают удочки</h3>
            <div className={styles.itemList}>
              <article>
                <h4>Удочка</h4>
                <p>Самая обычная удочка без требований к уровню. Ловит рыбу на один крючок.</p>
              </article>
              <article>
                <h4>Удочка (up)</h4>
                <p><strong>Минимальный уровень: 6.</strong> Ловит рыбу сразу на два крючка.</p>
              </article>
              <article>
                <h4>Удочка (up2)</h4>
                <p><strong>Минимальный уровень: 10.</strong> Ловит рыбу на три крючка. Крафтится примерно из миллиона разных рыб. Ну ладно, не из миллиона, но когда собираешь, кажется что именно так ))</p>
              </article>
              <article className={styles.sadItem}>
                <h4>Волшебная удочка ✨</h4>
                <p>Сокращает время рыбалки. Получить её могут игроки, занявшие первые три места в Фестивале рыбака.</p>
                <p><strong>У меня такой пока нет... Это очень печально :( </strong></p>
              </article>
            </div>

            <div className={styles.locationGallery}>
              <figure>
                <NaturalScreenshot src="/images/world/locations/lake-fishing.jpg" alt="Рыбалка на обычном Озере" width={1010} height={477} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Ждём, когда надпись «Подсечь» станет жёлтой</figcaption>
              </figure>
              <figure>
                <NaturalScreenshot src="/images/world/locations/fishing-rods.jpg" alt="Обычная удочка, Удочка up и Удочка up2" width={556} height={520} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Обычная удочка, Удочка up и Удочка up2</figcaption>
              </figure>
              <figure className={styles.compactFigure}>
                <NaturalScreenshot src="/images/world/locations/fishing-hook.jpg" alt="Жёлтая надпись Подсечь на кнопке" width={299} height={193} sizes="299px" />
                <figcaption>Вот теперь пора нажимать «Подсечь»</figcaption>
              </figure>
            </div>
          </section>
        )}

        {location.id === "forest" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Выбираем тропу и собираем</p>
            <h2>Как ходить по Зачарованному лесу</h2>
            <p>
              На весь поход по лесу даётся 15 минут. В начале перед тобой появляются три дороги: левая тропа, тропа прямо и правая тропа. Можно выбирать любую, неправильной здесь нет.
            </p>
            <ol className={styles.simpleSteps}>
              <li><span>1</span><p>Выбираешь любую из трёх троп и идешь по ней.</p></li>
              <li><span>2</span><p>Доходишь до поляны и нажимаешь «Собирать».</p></li>
              <li><span>3</span><p>После сбора снова выбираешь дорожку.</p></li>
              <li><span>4</span><p>Повторяешь всё, пока не пройдешь лес или не закончится время.</p></li>
            </ol>
            <p className={styles.reward}>
              За один поход встречаются четыре поляны. На каждой не забываем нажимать «Собирать», иначе зачем мы вообще тут собрались)
            </p>
            <p>
              Повторно зайти в лес после выхода можно будет через два часа.
            </p>
            <figure className={styles.wideFigure}>
              <NaturalScreenshot src="/images/world/locations/forest-paths.jpg" alt="Три тропы и кнопка Собирать в Зачарованном лесу" width={1006} height={469} sizes="(max-width: 1120px) 100vw, 1006px" />
              <figcaption>Можно пойти налево, прямо или направо. А на поляне нажимаем «Собирать»</figcaption>
            </figure>
          </section>
        )}

        {location.id === "shop" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Покупаем и продаём</p>
            <h2>Что есть в Лавке</h2>
            <p>
              В Лавке можно купить обычную экипировку (не МД), свою самую первую удочку, короб для сбора трав и подарки, которыми можно украсить инфу другого персонажа.
            </p>
            <p>
              Здесь же можно продать ненужные вещи, ресурсы и дроп. Чаще всего Лавка заплатит примерно половину их стоимости, поэтому сначала лучше проверить цены на соседнем Рынке. 
            </p>
            <p className={styles.reward}>
              <strong>Совет новичкам:</strong> продавайте в лавке только кровь (как бы это ни звучало)
            </p>
          </section>
        )}

        {location.id === "alchemist" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Магия, свитки и зелья</p>
            <h2>Что можно сделать у Алхимика</h2>
            <p>
              У Алхимика можно покупать магические свитки, зачаровывать предметы, варить зелья жизни и маны, а также создавать разные эликсиры.
            </p>
            <p>
              Если обычная вещь вдруг должна стать чуточку волшебнее, нам сюда ✨
            </p>
            <p>
              Какие ресурсы нужны для ЗЧ, смотри в <Link href="/crafting-guide#casting" className={styles.guideLink}>справочнике по заклинательству →</Link>.
            </p>
          </section>
        )}

        {location.id === "workshop" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Ремесло</p>
            <h2>Кожевничество в Мастерской</h2>
            <p>Здесь можно поставить заплатку на вещь. Прибавки к характеристикам и ресурсы для каждого уровня собраны в <Link href="/crafting-guide#leather" className={styles.guideLink}>справочнике по кожевничеству →</Link>.</p>
          </section>
        )}

        {location.id === "market" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Торговля между игроками</p>
            <h2>Как работает Рынок</h2>
            <p>
              На Рынке вещи продают сами игроки. Здесь обычно выгоднее покупать и продавать экипировку, ресурсы и дроп, чем сдавать всё в обычную Лавку.
            </p>

            <div className={styles.licenseGrid}>
              <article>
                <p className={styles.licensePrice}>1 терра-голд в месяц</p>
                <h3>Лицензия торговца</h3>
                <p>
                  Позволяет покупать и продавать вещи напрямую. Сделка работает, только если оба персонажа находятся онлайн, в одном городе и в одной комнате.
                </p>
              </article>
              <article>
                <p className={styles.licensePrice}>2 терра-голда в месяц</p>
                <h3>Лицензия лавочника</h3>
                <p>
                  Даёт все возможности Лицензии торговца и позволяет открыть собственную лавку. Другие игроки смогут покупать ваши вещи, даже когда вы оффлайн. 
                </p>
              </article>
            </div>

            <h3>Где купить лицензию</h3>
            <p>
              Откройте на Рынке вкладку «Своя палатка», затем нажмите «Купить лицензию». Там же доступны клановые лицензии.
            </p>
            <ul>
              <li>Если купить ещё одну такую же лицензию, срок её действия продлится.</li>
              <li>Если уже есть Лицензия торговца и купить Лицензию лавочника, торговая лицензия заменится на лавочную.</li>
            </ul>

            <h3>Задержка на повторную передачу</h3>
            <p className={styles.reward}>
              После передачи МД-вещи или её покупки у торговца либо в лавке следующий владелец не сможет передать или продать её в течение двух недель. Для уникальных вещей ограничение действует один месяц.
            </p>
            <figure className={styles.wideFigure}>
              <NaturalScreenshot src="/images/world/locations/market-own-stall.jpg" alt="Вкладка Своя палатка на Рынке" width={879} height={409} sizes="(max-width: 1120px) 100vw, 879px" />
              <figcaption>Во вкладке «Своя палатка» можно купить лицензию лавочника</figcaption>
            </figure>
          </section>
        )}

        {location.id === "royal-shop" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Покупки за терра-голд</p>
            <h2>Что продаётся в Королевской лавке</h2>
            <p>
              В Королевской лавке продаются вещи и свитки за терра-голд. Здесь есть отдельные разделы с МД-вещами, уникальными вещами, улучшениями, VIP-свитками и другими полезностями.
            </p>

            <h3>Где взять терра-голд</h3>
            <ul>
              <li>Купить за реальные деньги через ссылку «Купить терра-голд» в верхней части игры... или у диллера... или спросить у админа</li>
              <li>Купить за серебро у другого игрока, если кто-то выставил теру на продажу.</li>
            </ul>
            <p className={styles.reward}>
              При покупке у игроков курс может меняться. Если теры в продаже нет, можно немного подождать и проверить позже. 
            </p>
            <figure className={styles.wideFigure}>
              <NaturalScreenshot src="/images/world/locations/royal-shop-terra.jpg" alt="Покупка терра-голда за серебро у игроков" width={1004} height={413} sizes="(max-width: 1120px) 100vw, 1004px" />
              <figcaption>Терра-голд, выставленный игроками на продажу за серебро</figcaption>
            </figure>
          </section>
        )}

        {location.id === "towers" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Опыт для всего сообщества</p>
            <h2>Башня Познания</h2>
            <p>
              Башня Познания позволяет всему сообществу получать дополнительный опыт в любых боях. У каждого сообщества своя Башня, которую нужно сначала построить, а потом постоянно поддерживать. Да, недвижимость даже в ДМ требует расходов ;)
            </p>

            <h3>Как построить Башню</h3>
            <p>
              В самом начале на месте Башни есть только фундамент. Для каждого нового уровня нужны ресурсы, а их точное количество всегда указано в самой локации.
            </p>
            <ul>
              <li>Каждый построенный уровень добавляет сообществу процент к опыту во всех боях.</li>
              <li>Максимальный уровень Башни: 10.</li>
              <li>Каждый следующий уровень требует немного больше ресурсов.</li>
              <li>Строить Башню может только Глава Сообщества.</li>
            </ul>

            <h3>Как поддерживать Башню</h3>
            <p>
              Построенной Башне ежедневно нужны ресурсы, иначе она начинает разрушаться. Плата за содержание снимается из Хранилища ресурсов один раз в сутки, в 00:00 по времени сервера. Само Хранилище находится здесь же, в локации Башни, а сдавать ресурсы может любой участник сообщества.
            </p>
            <p>
              Если ресурсов для содержания текущего уровня не хватает, Башня теряет один уровень в сутки. Например, с 10-го до 1-го уровня без поддержки она опустится за девять дней. Поэтому лучше иногда заглядывать в Хранилище, пока от нашей прекрасной Башни снова не остался один фундамент 🫣
            </p>
            <p>
              Стоимость строительства и ежедневной поддержки зависит от силы сообщества. Чем слабее сообщество, тем меньше ресурсов ему требуется.
            </p>

            <p className={styles.reward}>
              <strong>Почему это особенно важно:</strong> после того как персонажам 15-го уровня уменьшили опыт за мобов, полностью получать его они могут только при Башне Познания 10-го уровня.
            </p>

            <figure className={styles.wideFigure}>
              <NaturalScreenshot src="/images/world/locations/towers.jpg" alt="Строительство и поддержка Башни Познания 10-го уровня" width={1014} height={402} sizes="(max-width: 1120px) 100vw, 1014px" />
              <figcaption>Башня 10-го уровня и Хранилище ресурсов</figcaption>
            </figure>
          </section>
        )}

        {location.id === "city-hall" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Хранилища, реинкарнация и законная любовь</p>
            <h2>Что находится в Мэрии</h2>
            <div className={styles.itemList}>
              <article>
                <h4>Хранилища</h4>
                <p>В Мэрии находятся хранилища сообществ и альянсов.</p>
              </article>
              <article>
                <h4>Возрождение</h4>
                <p>Во вкладке «Возрождение» можно переключиться на реинкарнанта, а потом вернуться обратно.</p>
              </article>
              <article>
                <h4>Бракосочетание 💍</h4>
                <p>Во вкладке «Бракосочетание»... Ну, тут и так понятно, что происходит ))</p>
              </article>
            </div>
            <Link href="/couples" className={styles.guideButton}>
              Им посчастливилось найти друг друга
            </Link>
          </section>
        )}

        {location.id === "arena" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Бои между игроками</p>
            <h2>Что происходит на Арене гладиаторов</h2>
            <p>
              Арена гладиаторов представляет собой PvP-локацию. Здесь игроки сражаются не с мобами, а друг с другом.
            </p>
            <h3>«Смешки»</h3>
            <p>
              Чаще всего на Арене проходят так называемые «Смешки», то есть Смешанные бои. Игроки заходят в общую заявку, после чего система распределяет всех участников на две команды. Затем начинается бой, и заранее выбрать себе союзников не получится. Кого выдали, с теми и побеждаем ))
            </p>
            <h3>Другие виды боёв</h3>
            <p>
              Иногда здесь проходят бои один на один. Стенок и расовых боёв не было уже очень давно, поэтому сейчас это скорее воспоминание старожилов, чем обычное событие.
            </p>
          </section>
        )}

        {location.id === "grey-cave" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Пешком или телепортом</p>
            <h2>Как попасть в Серую Пещеру</h2>
            <p>Добраться до Пещеры можно двумя способами:</p>
            <ul>
              <li>Пройти по дороге из города. Путь занимает 10 минут.</li>
              <li>Использовать свиток телепорта и оказаться в Пещере сразу.</li>
            </ul>
            <p className={styles.reward}>
              У VIP-игроков есть бесконечный VIP-телепорт. Никуда идти не нужно и свитки не заканчиваются. Красота ✨
            </p>
          </section>
        )}

        {location.id === "underground-lake" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Рыбалка под землёй</p>
            <h2>Подземное озеро</h2>
            <p>
              Рыбачить в Подземном озере можно один раз в пять часов. Если ждать не хочется, можно принести перо Хранителю и получить ещё одну возможность порыбачить.
            </p>
            <p>
              Перо выпадает из мобов вашего уровня, но сначала нужно взять квест у Каменного мудреца.
            </p>

            <h3>Как проходит рыбалка</h3>
            <p>
              Принцип почти такой же, как и на обычном Озере. Закидываем удочку, ждём, пока надпись «Подсечь» станет жёлтой, и нажимаем на кнопку. Рыбалка длится до пяти минут.
            </p>
            <p>
              Но есть одна особенность. Если вместо рыбы вытянули "мусор" - водоросли, дырявый сапог, рака или прочую лягушку - то можно закинуть удочку ещё раз. Так продолжается, пока наконец не поймается рыбка. И так уж в нашем мире повелось, самая дорогая рыба - это водоросли, так как из них можно крафтить свитки рыбака для фестивалей ;) 
            </p>

            <h3>Золотая рыбка</h3>
            <p>
              Один раз в день в Подземном озере можно взять квест на Золотую рыбку. Если она поймается, в награду получаем три базовых опыта. Это в три раза больше, чем дают одна слива, кусочек мяса или шкурка андвари на фестивале. Сколько таких наград нужно до апа, можно прикинуть в <Link href="/experience#festival-experience" className={styles.guideLink}>калькуляторе опыта →</Link>
            </p>

            <div className={styles.locationGallery}>
              <figure>
                <NaturalScreenshot src="/images/world/locations/underground-fishing.jpg" alt="Рыбалка в Подземном озере" width={1018} height={459} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Рыбалка длится до пяти минут</figcaption>
              </figure>
              <figure className={styles.compactFigure}>
                <NaturalScreenshot src="/images/world/locations/golden-fish.jpg" alt="Золотая рыбка из ежедневного задания" width={570} height={90} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Та самая Золотая рыбка</figcaption>
              </figure>
              <figure>
                <NaturalScreenshot src="/images/world/locations/golden-fish-experience.jpg" alt="Награда опытом за Золотую рыбку" width={696} height={351} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Награда опытом за выполненное задание</figcaption>
              </figure>
            </div>
          </section>
        )}

        {location.id === "labyrinth" && (
          <section className={styles.locationGuide}>
            <p className={styles.eyebrow}>Пазлы, сундуки и Повелитель</p>
            <h2>Как устроен Лабиринт</h2>
            <p>
              Новый поход в Лабиринт становится доступен каждый день в 00:00 по времени сервера. Лабиринты бывают одиночными и групповыми. Для группового необходима компания из 4х персонажей одного уровня. Вероятность того, что соберется 4 новичка в групповой лаб - отрицательная, поэтому нет смысла расписывать что там делать, если ты идешь впервые - спрашивай у сокомандников, они все объяснят. 
            </p>

            <h3>Что нужно делать, если ты пошел в лабиринт в одиночку?</h3>
            <ol className={styles.simpleSteps}>
              <li><span>1</span><p>Если ты совсем мелкий: Ходишь по коридорам, собираешь части пазла, стараешься не попадаться мобам на глаза.</p></li>
              <p>Если ты уже вполне уверенно стоишь на ногах: Ходишь по коридорам, сражаешься с мобами и собираешь части пазла.</p>
              <li><span>2</span><p>Собираешь пазл полностью и получаешь два ключа, по ходу дела запоминай расположение сундуков - пригодится.</p></li>
              <li><span>3</span><p>Находишь и открываешь этими ключами два сундука.</p></li>
              <li><span>4</span><p>Убиваешь Повелителя Лабиринта (он сильный! очень! на то он и босс.. ну не попробуешь - не узнаешь) и получаешь третий ключ.</p></li>
              <li><span>5</span><p>Третьим ключом открываешь последний сундук. </p></li>
            </ol>

            <h3>Что может попасться в сундуках</h3>
            <p>
              В сундуках можно найти Сердца Лабиринта, зелья или пустые бутылки. А ещё там могут прятаться Духи Лабиринта, которые выпьют всю жизнь, всю ману или сразу и то и другое
            </p>

            <div className={styles.locationGallery}>
              <figure>
                <NaturalScreenshot src="/images/world/locations/labyrinth-mob-fight.jpg" alt="Бой с обычным мобом в Лабиринте" width={1086} height={482} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Бой с обычным мобом</figcaption>
              </figure>
              <figure>
                <NaturalScreenshot src="/images/world/locations/labyrinth-boss-fight.jpg" alt="Бой с Повелителем Лабиринта" width={1040} height={499} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Бой с Повелителем Бармаглотов за третий ключ</figcaption>
              </figure>
              <figure className={styles.compactFigure}>
                <NaturalScreenshot src="/images/world/locations/labyrinth-heart.jpg" alt="Золотое Сердце в сундуке Лабиринта" width={567} height={359} sizes="(max-width: 780px) 100vw, 520px" />
                <figcaption>Золотое Сердце из сундука</figcaption>
              </figure>
            </div>
          </section>
        )}

        <div className={styles.columns}>
          <section className={styles.card}>
            <p className={styles.eyebrow}>От Дома</p>
            <h2>Как добраться</h2>
            {location.id === "home" ? (
              <p className={styles.empty}>Ты уже дома 😊</p>
            ) : (
              <ol className={styles.steps}>
                {route.map((step, index) => (
                  <li key={`${step.from}-${step.to}`}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{LOCATION_BY_ID.get(step.to)?.name}</strong>
                      <p>{step.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            <Link href={`/world?from=home&to=${location.id}#world-route`} className={styles.mapButton}>
              Показать на общей карте
            </Link>
          </section>

          <aside className={styles.card}>
            <p className={styles.eyebrow}>Переходы</p>
            <h2>Куда можно пройти</h2>
            <div className={styles.neighbours}>
              {neighbours.map((item) => (
                <Link key={item.id} href={`/world/${item.slug}`}>
                  <span>{item.name}</span>
                  <b aria-hidden="true">→</b>
                </Link>
              ))}
            </div>
            {location.guideHref && (
              <Link href={location.guideHref} className={styles.guideButton}>
                {location.guideLabel || "Открыть гайд"}
              </Link>
            )}
          </aside>
        </div>

        {location.id === "bestiary" && (
          <section className={styles.monsterGrid} aria-label="Мобы Бестиария">
            {Array.from({ length: 20 }, (_, index) => {
              const number = String(index + 1).padStart(2, "0");
              return (
                <div key={number}>
                  <img
                    src={`/images/world/locations/bestiary-monster-${number}.webp`}
                    alt={`Моб Бестиария ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              );
            })}
          </section>
        )}
      </article>
    </main>
  );
}
