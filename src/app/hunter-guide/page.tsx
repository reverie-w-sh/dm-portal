import Link from "next/link";
import ScreenshotModal from "./ScreenshotModal";

const animals = [
  ["🐰", "Заяц", "4"],
  ["🐺", "Волк", "2"],
  ["🐗", "Кабан", "2"],
  ["🐻", "Медведь", "1"],
];

const guideSteps = [
  {
    n: "01",
    title: "Зайди в Охотничьи угодья",
    text: "Охота в Древнем Мире проходит на отдельной карте 4×4. Твой персонаж находится в одной из 16 клеток, а звери заранее спрятаны по карте.",
    image: "/images/hunter-guide/ohota-karta.webp",
    alt: "Карта Охотничьих угодий 4 на 4 в игре Древний Мир",
    imageTitle: "Охотничьи угодья - карта охоты в древнем мире",
  },
  {
    n: "02",
    title: "Осматривай местность",
    text: "Нажимай «Осмотреться», чтобы узнать, что находится вокруг тебя. После осмотра на карте появятся найденные звери. Этих зверей (а так же пустые клетки) можно сразу отметить в Планшете охотника. Так постепенно открывается вся карта.",
    image: "/images/hunter-guide/ohota-osmotr.webp",
    alt: "Осмотр местности на карте охоты в Древнем Мире",
    imageTitle: "Осмотр соседних клеток во время охоты в ДМ",
  },
  {
    n: "03",
    title: "Запоминай найденных зверей",
    text: "На каждой охоте на карте находятся девять зверей: четыре зайца, два волка, два кабана и один медведь. Это фиксированный состав, поэтому ближе к концу можно легко понять, кого тебе ещё не хватает.",
    image: "/images/hunter-guide/ohota-nayden-kaban.webp",
    alt: "Найденный кабан на карте охоты в игре Древний Мир",
    imageTitle: "Найденный зверь на карте охоты",
  },
  {
    n: "04",
    title: "Подойди к клетке со зверем",
    text: "После того как зверь найден на карте, перейди в его клетку. Во время перехода главное - не забыть выбрать правильное оружие. Хотя, если ты читаешь эту инструкцию, вариантов у меня только два 😏 Либо ты новичок и охотиться пока можешь только на зайцев - тогда бери свою пращу, иди к зайцам и больше ни к кому не лезь 😅 Либо ты просто любишь почитать)) А если ещё и писать любишь - нажми на конвертик вверху, давай попереписываемся?))   ",
    image: "/images/hunter-guide/ohota-perehod.webp",
    alt: "Передвижение по Охотничьим угодьям в игре Древний Мир",
    imageTitle: "Переход между клетками карты охоты",
  },
  {
    n: "05",
    title: "Ищи зверя в трёх направлениях",
    text: "Пришёл в клетку со зверем? Теперь его ещё надо найти :) Искать можно в трёх направлениях: слева, по центру и справа. Проверяй по очереди. Если в первом месте никого нет - пробуй второе. Если пустыми оказались уже два, значит зверь прячется в третьем.",
    image: "/images/hunter-guide/ohota-poisk-zverya.webp",
    alt: "Кнопки поиска слева по центру и справа во время охоты",
    imageTitle: "Три направления поиска зверя",
  },
  {
    n: "06",
    title: "Зафиксируй результат",
    text: "Сообщение «никого не нашли» означает, что эта точка поиска пустая. Когда зверь найден, игра сообщает результат охоты и попытки снять шкуру.",
    image: "/images/hunter-guide/ohota-nikogo-ne-nashli.webp",
    alt: "Сообщение никого не нашли во время поиска зверя",
    imageTitle: "Неудачное направление поиска зверя",
  },
  {
    n: "07",
    title: "Посчитай очки",
    text: "Нашёл зверя - получаешь очки. Если шкурку снять не удалось +1. Получилась одна шкурка +3, две шкурки +6. Но две шкуры - это уже радости более прокачанных охотников :)  ",
    image: "/images/hunter-guide/ohota-kaban-nayden.webp",
    alt: "Результат поиска кабана и получение шкуры в Древнем Мире",
    imageTitle: "Результат охоты и снятие шкуры",
  },
];

function Shot({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  return <ScreenshotModal src={src} alt={alt} title={title} />;
}

export default function HunterGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Как охотиться в игре Древний Мир (DM)",
    description:
      "Пошаговая инструкция по охоте в Древнем Мире: карта 4×4, осмотр, поиск зверей и подсчёт очков.",
    step: guideSteps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.text,
      image: `https://wolfchen-clan.com${step.image}`,
    })),
  };

  return (
    <main className="min-h-screen px-3 py-5 text-[#e9dfcf] sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-[1090px] rounded-2xl border border-[#79501f] bg-[rgba(4,5,4,.96)] p-4 shadow-[0_20px_55px_rgba(0,0,0,.5),inset_0_0_35px_rgba(0,0,0,.25)] sm:p-7">
        <header>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#b88942]">
            Древний Мир · охота с самого начала
          </p>
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-[#d9b46f] drop-shadow-[0_2px_10px_rgba(0,0,0,.9)] sm:text-4xl">
            Охота в «Древнем Мире»: подробная инструкция для новичка
          </h1>
          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#cbb58d]">
            Если ты впервые попал в Охотничьи угодья и пока не очень понимаешь, что тут вообще делать - сейчас разберёмся :)
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/hunter-board"
              className="rounded-xl border border-[#9a6829] bg-[#24170a] px-4 py-2.5 text-sm font-bold text-[#edcf94] transition hover:bg-[#30200d]"
            >
              Открыть Планшет охотника →
            </Link>
            <a
              href="#steps"
              className="rounded-xl border border-[#5f4a2b] bg-[#090a09] px-4 py-2.5 text-sm font-bold text-[#c5ad82] transition hover:border-[#8e672d]"
            >
              К инструкции ↓
            </a>
          </div>
          <div className="divider-accent mt-7" />
        </header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
          <div className="rounded-2xl border border-[#68451d] bg-[#070807] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9814a]">
              Главное правило карты
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#ecd4a6]">На охоте всегда 9 зверей</h2>
            <p className="mt-3 text-sm leading-7 text-[#baa787]">
              Поле охоты состоит из 16 клеток. Среди них спрятаны девять зверей.
              Остальные клетки пустые. Состав зверей фиксирован - это очень помогает не
              тратить лишний осмотр в конце охоты.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {animals.map(([emoji, name, count]) => (
                <div key={name} className="rounded-xl border border-[#68451d] bg-[#0b0c0b] p-3 text-center">
                  <div className="text-3xl">{emoji}</div>
                  <div className="mt-1 text-sm font-bold text-[#e1c79a]">{name}</div>
                  <div className="mt-1 text-xs text-[#a98e66]">{count} на карте</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#68451d] bg-[#070807] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9814a]">Перед первой охотой</p>
            <h2 className="mt-2 text-2xl font-black text-[#ecd4a6]">Если охота ещё не открыта</h2>
            <p className="mt-3 text-sm leading-7 text-[#baa787]">
              Охота открывается с 4 уровня. В Лесном домике поговори с Дядюшкой Егерем. Он меняет кучу ресурсов на охотничье снаряжение. 
            </p>
            <Shot
              src="/images/hunter-guide/ohota-lesnoi-domik.webp"
              alt="Дядюшка Егерь в Лесном домике игры Древний Мир"
              title="Лесной домик или где получить охотничье снаряжение"
            />
          </div>
        </section>

        <section className="mt-7 rounded-2xl border border-[#68451d] bg-[#070807] p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9814a]">Полезная экипировка</p>
              <h2 className="mt-2 text-2xl font-black text-[#ecd4a6]">Шапка следопыта</h2>
              <p className="mt-3 text-sm leading-7 text-[#baa787]">
                Шапка следопыта сокращает время осмотра, передвижения и поиска зверей на 25%. Для самой механики охоты она не
                обязательна, но заметно ускоряет процесс.
              </p>
            </div>
            <Shot
              src="/images/hunter-guide/ohota-ekipirovka.webp"
              alt="Шапка следопыта в экипировке для охоты в Древнем Мире"
              title="Шапка следопыта - ускорение действий на охоте на 25%"
            />
          </div>
        </section>

        <section id="steps" className="mt-10 scroll-mt-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9814a]">Пошагово</p>
          <h2 className="mt-2 text-3xl font-black text-[#ecd4a6]">Как проходит охота</h2>

          <div className="mt-6 space-y-5">
            {guideSteps.map((step) => (
              <section key={step.n} className="rounded-2xl border border-[#68451d] bg-[#070807] p-4 sm:p-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#8c6028] bg-[#1a1108] text-sm font-black text-[#dcb877]">
                    {step.n}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#ead1a2]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#baa787]">{step.text}</p>
                  </div>
                </div>
                <Shot src={step.image} alt={step.alt} title={step.imageTitle} />
              </section>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#79501f] bg-[#0a0906] p-5 sm:p-6">
          <h2 className="text-2xl font-black text-[#ecd4a6]">
            А чтобы не запутаться - отмечай всё в Планшете 🐾
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#baa787]">
            <p>
              После каждого осмотра переноси найденных зверей в Планшет охотника.
              Пустые клетки тоже отмечай сразу - так ты всегда будешь видеть, где уже был
              и куда ещё стоит сходить.
            </p>
            <p>
              Когда начинаешь искать зверя, отмечай результат каждого направления:
              × - никого, +1 - зверь найден без шкурки, +3 - одна шкурка,
              +6 - две шкурки.
            </p>
            <p>
              Планшет сам считает найденных зверей и очки, поэтому тебе остаётся только
              вовремя нажимать на нужные клеточки :)
            </p>
            <p>
              И маленькая хитрость напоследок: если осталась одна неизвестная клетка,
              просто посмотри, кого из 9 зверей тебе не хватает. Например, уже найдены
              4 зайца, 2 волка, 2 кабана, а медведя нет? Ну вот он там и сидит 😏
            </p>
          </div>
          <Shot
            src="/images/hunter-guide/ohota-karta-4x4.webp"
            alt="Карта 4 на 4 с открытыми и неизвестными клетками охоты"
            title="Карта охоты и Планшет охотника"
          />
        </section>

        <section className="mt-8 rounded-2xl border border-[#79501f] bg-[#080907] p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a9814a]">
            Снаряжение у Дядюшки Егеря
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#ecd4a6]">
            Что нужно для каждого зверя
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#baa787]">
            Снаряжение открывается постепенно. На скриншотах ниже есть и подсказки Егеря,
            и полный набор ресурсов с точным количеством. Нажимай на картинки - они откроются поверх страницы в полном размере, чтобы всё можно было нормально прочитать.
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-[#68451d] bg-[#070807] p-4">
              <h3 className="text-xl font-black text-[#ead1a2]">🐰 Заяц - праща</h3>
              <p className="mt-2 text-sm leading-6 text-[#aa987a]">
                С неё всё начинается. Дядюшка Егерь предлагает начать с охоты на зайцев
                и отдаёт пращу после того, как ты принесёшь нужный набор ресурсов.
              </p>
              <div className="mt-4 rounded-lg border border-[#4f3b22] bg-[#0b0c0b] p-3 text-sm leading-7 text-[#c7b18b]">
                <div><b className="text-[#ead1a2]">Уголь</b> - 1</div>
                <div><b className="text-[#ead1a2]">Железное дерево</b> - 1</div>
                <div><b className="text-[#ead1a2]">Железная руда</b> - 1</div>
                <div><b className="text-[#ead1a2]">Серебро</b> - 1</div>
                <div><b className="text-[#ead1a2]">Капля крови</b> - 50</div>
                <div><b className="text-[#ead1a2]">Корм</b> - 30</div>
                <div><b className="text-[#ead1a2]">Кровавое Сердце</b> - 1</div>
                <div><b className="text-[#ead1a2]">Душа повелителя</b> - 1</div>
                <div><b className="text-[#ead1a2]">Крысиная лапка</b> - 1</div>
                <div><b className="text-[#ead1a2]">Крыло летучей мыши</b> - 1</div>
              </div>
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik.webp"
                alt="Дядюшка Егерь предлагает пращу для охоты на зайцев"
                title="Праща для охоты на зайцев"
              />
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-nagrada.webp"
                alt="Ресурсы, необходимые для получения пращи у Дядюшки Егеря"
                title="Ресурсы для пращи - точные предметы и количество"
              />
            </section>

            <section className="rounded-xl border border-[#68451d] bg-[#070807] p-4">
              <h3 className="text-xl font-black text-[#ead1a2]">🐺 Волк - Копье охотника</h3>
              <p className="mt-2 text-sm leading-6 text-[#aa987a]">
                Следующий зверь - волк. Для охоты на него нужно Копье охотника.
                На втором скриншоте видны все ресурсы и их количество.
              </p>
              <div className="mt-4 rounded-lg border border-[#4f3b22] bg-[#0b0c0b] p-3 text-sm leading-7 text-[#c7b18b]">
                <div><b className="text-[#ead1a2]">Дуб</b> - 1</div>
                <div><b className="text-[#ead1a2]">Топаз</b> - 1</div>
                <div><b className="text-[#ead1a2]">Сапфир</b> - 1</div>
                <div><b className="text-[#ead1a2]">Кости</b> - 1</div>
                <div><b className="text-[#ead1a2]">Мухомор</b> - 8</div>
                <div><b className="text-[#ead1a2]">Шкура зайца</b> - 50</div>
                <div><b className="text-[#ead1a2]">Капля крови</b> - 35</div>
              </div>
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-dialog.webp"
                alt="Дядюшка Егерь рассказывает про Копье охотника для охоты на волка"
                title="Копье охотника для охоты на волка"
              />
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-resursy.webp"
                alt="Ресурсы, необходимые для получения Копья охотника для охоты на волка"
                title="Ресурсы для Копья охотника - точные предметы и количество"
              />
            </section>

            <section className="rounded-xl border border-[#68451d] bg-[#070807] p-4">
              <h3 className="text-xl font-black text-[#ead1a2]">🐗 Кабан - Копье следопыта</h3>
              <p className="mt-2 text-sm leading-6 text-[#aa987a]">
                Для охоты на кабана нужно Копье следопыта. Рядом оставлен скрин со всем
                набором ресурсов и точным количеством.
              </p>
              <div className="mt-4 rounded-lg border border-[#4f3b22] bg-[#0b0c0b] p-3 text-sm leading-7 text-[#c7b18b]">
                <div><b className="text-[#ead1a2]">Бечевка</b> - 2</div>
                <div><b className="text-[#ead1a2]">Кожа</b> - 2</div>
                <div><b className="text-[#ead1a2]">Ткань</b> - 2</div>
                <div><b className="text-[#ead1a2]">Мухомор</b> - 3</div>
                <div><b className="text-[#ead1a2]">Капля крови</b> - 35</div>
                <div><b className="text-[#ead1a2]">Шкура зайца</b> - 50</div>
                <div><b className="text-[#ead1a2]">Шкура волка</b> - 25</div>
                <div><b className="text-[#ead1a2]">Декоративная трава</b> - 1</div>
              </div>
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-zadanie.webp"
                alt="Дядюшка Егерь предлагает Копье следопыта для охоты на кабана"
                title="Копье следопыта для охоты на кабана"
              />
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-nagrady.webp"
                alt="Ресурсы, необходимые для получения Копья следопыта для охоты на кабана"
                title="Ресурсы для Копья следопыта - точные предметы и количество"
              />
            </section>

            <section className="rounded-xl border border-[#68451d] bg-[#070807] p-4">
              <h3 className="text-xl font-black text-[#ead1a2]">🐻 Медведь - рогатина</h3>
              <p className="mt-2 text-sm leading-6 text-[#aa987a]">
                Для продвинутых охотников Егерь предлагает рогатину на медведя.
                На скриншоте с наградой виден полный список ресурсов и нужное количество.
              </p>
              <div className="mt-4 rounded-lg border border-[#4f3b22] bg-[#0b0c0b] p-3 text-sm leading-7 text-[#c7b18b]">
                <div><b className="text-[#ead1a2]">Уголь</b> - 10</div>
                <div><b className="text-[#ead1a2]">Дуб</b> - 10</div>
                <div><b className="text-[#ead1a2]">Бечевка</b> - 10</div>
                <div><b className="text-[#ead1a2]">Мухомор</b> - 5</div>
                <div><b className="text-[#ead1a2]">Капля крови</b> - 50</div>
                <div><b className="text-[#ead1a2]">Декоративная трава</b> - 3</div>
                <div><b className="text-[#ead1a2]">Шкура зайца</b> - 50</div>
                <div><b className="text-[#ead1a2]">Шкура волка</b> - 25</div>
                <div><b className="text-[#ead1a2]">Шкура кабана</b> - 25</div>
              </div>
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-progress.webp"
                alt="Дядюшка Егерь рассказывает про рогатину для охоты на медведя"
                title="Рогатина для охоты на медведя"
              />
              <Shot
                src="/images/hunter-guide/ohota-lesnoi-domik-nagrada-2.webp"
                alt="Ресурсы, необходимые для получения рогатины для охоты на медведя"
                title="Ресурсы для рогатины - точные предметы и количество"
              />
            </section>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#68451d] bg-[#070807] p-5">
            <div className="text-2xl font-black text-[#b9797d]">×</div>
            <h3 className="mt-2 font-black text-[#ead1a2]">Никого</h3>
            <p className="mt-2 text-sm leading-6 text-[#aa987a]">Точка поиска пустая. Переходи к следующему направлению.</p>
          </div>
          <div className="rounded-xl border border-[#68451d] bg-[#070807] p-5">
            <div className="text-2xl font-black text-[#bd8b45]">+1</div>
            <h3 className="mt-2 font-black text-[#ead1a2]">Без шкурки</h3>
            <p className="mt-2 text-sm leading-6 text-[#aa987a]">Зверь найден, но снять шкуру не получилось.</p>
          </div>
          <div className="rounded-xl border border-[#68451d] bg-[#070807] p-5">
            <div className="text-2xl font-black text-[#efd08b]">+3 / +6</div>
            <h3 className="mt-2 font-black text-[#ead1a2]">Шкура</h3>
            <p className="mt-2 text-sm leading-6 text-[#aa987a]">Одна полученная шкура даёт 3 очка, две - 6 очков, но эта радость доступна только продвинутым охотникам.</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#79501f] bg-[linear-gradient(145deg,#0c0b08,#080908)] p-5 text-center sm:p-7">
          <h2 className="text-2xl font-black text-[#ecd4a6]">Не хочется держать всё в голове?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#baa787]">
            Отмечай зверей, пустые направления и результат каждого поиска в Планшете охотника.
            Он сам считает найденных зверей и очки и сохраняет карту в браузере.
          </p>
          <Link
            href="/hunter-board"
            className="mt-5 inline-flex rounded-xl border border-[#9a6829] bg-[#291a0b] px-5 py-3 text-sm font-black text-[#f0d29b] transition hover:bg-[#36230e]"
          >
            Перейти к Планшету охотника →
          </Link>
        </section>
      </article>
    </main>
  );
}
