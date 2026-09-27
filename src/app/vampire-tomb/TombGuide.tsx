"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type Shot = { number: number; caption: string; text: string; alt?: string };
type Chapter = { id: string; title: string; short: string; lead: string; shots: Shot[]; note?: string };

const chapters: Chapter[] = [
  {
    id: "lair", title: "Вход", short: "Вход", lead: "Начинаем с самого входа. Скрины идут в том же порядке, что и в игре.",
    shots: [
      { number: 1, caption: "Вход в Гробницу", text: "При входе в Гробницу вампиров справа внизу увидишь «Логово» - это как раз то, что тебе нужно." },
      { number: 2, caption: "«Отвали, я за руной!»", text: "Убедительно говоришь, что ты за руной. Стражу лишних вопросов лучше не задавать." },
      { number: 3, caption: "Чугунный ключ", text: "Показываешь чугунный ключ. Проверь, что он у тебя есть, ещё до похода." },
      { number: 4, caption: "Выбираем «Древний мир»", text: "Попадаешь на развилку. Не спрашивай почему, но нужная тебе дорога называется «Древний мир»." },
      { number: 5, caption: "Войти", text: "Нажимая «Войти», ты подписываешь добровольное согласие отдать чугунный ключ и отказ от жалоб на то, что с тобой будет происходить далее." },
    ],
  },
  {
    id: "smith", title: "Кристальный зал и кузнец", short: "Кузнец", lead: "Сначала налево за болтами. Без них у моста делать нечего.",
    shots: [
      { number: 6, caption: "Кристальный зал", text: "Вот мы и в Кристальном зале. Отсюда идём налево, к кузнецу." },
      { number: 7, caption: "Кузнец", text: "Кузнецу нужны 3 угля, 3 железных руды и 3 дуба. В обмен он сделает 2 осадных арбалетных болта." },
      { number: 8, caption: "Два болта готовы", text: "Забираешь болты и возвращаешься в Кристальный зал. Оттуда идём прямо, к подъёмному мосту." },
    ],
    note: "Если оба болта уйдут в никуда, возвращайся к кузнецу с новой порцией ресурсов.",
  },
  {
    id: "bridge", title: "Подъёмный мост и грибница", short: "Мост", lead: "Теперь надо открыть баллисту, снять с неё замок и попасть по цепям. Да, это три разных заботы.",
    shots: [
      { number: 9, caption: "Код на баллисте", text: "У моста подбираешь код. Четыре цифры, каждая от 1 до 4, так что вариантов 256. Можно узнать код перебором значений." },
      { number: 10, caption: "Ошибка и землеройки", text: "Если код неправильный, на тебя может напасть землеройка, а иногда и две. А могут и не напасть вовсе. Убивай и подбирай код дальше. Или просто нажимай наугад, чтоб быстрее бить землероек и жди, когда из них радужный гриб выпадет." },
      { number: 11, caption: "Сказочный гриб", text: "Из землероек в качестве дропа может выпасть сказочный гриб. Он-то нам и нужен, чтобы снять замок с баллисты." },
      { number: 12, caption: "Грибница", text: "Здесь отдаёшь сказочный гриб и 2 зверобоя лесного. Не забудь заранее полечиться: на тебя сразу же нападут две землеройки." },
      { number: 13, caption: "Бой с землеройками", text: "Побеждаешь двух землероек, и магический замок с баллисты снят." },
      { number: 14, caption: "Замок снят", text: "Вот теперь можно снова идти к подъёмному мосту." },
      { number: 15, caption: "Стреляем по цепям", text: "Заряжай и стреляй по креплению цепи. Там появится мишень. Если мост ещё не открылся, повторяй и при необходимости делай новые болты у кузнеца." },
    ],
    note: "Открылся мост? Идём дальше. Не открылся? Проверяем болты и возвращаемся к баллисте.",
  },
  {
    id: "bones", title: "Развилка и Зал костей", short: "Зал костей", lead: "Мост позади. Восстанавливай здоровье и иди налево, в Зал костей, играть в увлекательные шахматы.",
    shots: [
      { number: 16, caption: "Развилка", text: "Мост позади. Восстанавливай здоровье и иди налево, в Зал костей, играть в увлекательные шахматы." },
      { number: 17, caption: "Шахматная доска", text: "Нужно провести синего человечка к сундуку мимо двух коней, ладьи и фигуры, нарисованной как ферзь, но ходящей как слон." },
      { number: 18, caption: "Синий человечек - это ты", text: "Если тебя поймали, восстанови жизнь и ману зельями (или ВИПом, смотря что у тебя есть) и пробуй снова. Попыток сколько угодно, но уложиться нужно в 15 минут." },
      { number: 19, caption: "Дойти до сундука", text: "Добрался до сундука - открывай его." },
      { number: 20, caption: "Жуткий медальон", text: "В сундуке найдёшь Жуткий медальон. Гордо несёшь его в Логово тварей. Да, там так и написано." },
    ],
  },
  {
    id: "beasts", title: "Медальон и Логово тварей", short: "Медальон", lead: "Медальон несём в Логово тварей. Перед разговором проверь, чем будешь отбиваться.",
    shots: [
      { number: 21, caption: "Показываем Жуткий медальон", text: "Проверь комплект! И элик! Если ты не верт, то надень щит, у4, что там у тебя ещё есть... В Логове тварей говоришь, что у тебя есть медальон." },
      { number: 22, caption: "Четыре землеройки", text: "И тут же на тебя нападают 4 землеройки, которых нужно убить. Их раскачка случайная. Давай, ты сможешь, я в тебя верю! Я же смогла." },
    ],
  },
  {
    id: "alchemy", title: "Алхимик и большая руна", short: "Руна", lead: "Вот и Алхимик. Здесь варим большую руну жизни, силы, брони или меткости. Какой рецепт сработает и какая именно руна получится, заранее не узнаешь: тут как повезёт.",
    shots: [
      { number: 23, caption: "Алхимик", text: "Убил землероек? Молодец! Дальше можно наконец расслабиться. Алхимик объясняет, что котёл варит руны и что с травками придётся поэкспериментировать. Но это мы и сами знаем, мы ж тут не случайно оказались." },
      { number: 24, caption: "Первая попытка", text: "Справа котёл, слева травки. Для одного рецепта нужны три разные травы из четырёх: папоротник, базилик, розмарин и корень мандрагоры. Перетяни их по очереди в котёл. Травка, которая уже в котле, становится неактивна. Смотри скрин: в моём котле всё, кроме корня мандрагоры. Нажимай «Сварить»." },
      { number: 25, caption: "Вторая попытка", text: "У меня с первого раза сварить не получилось, так что вот тебе скрин второй попытки. На этот раз в котле оказались БРМ." },
      { number: 26, caption: "Варим с третьей попытки", text: "Когда руна наконец сварится, тебя выбросит из локации, а система напишет, какая именно руна получилась." },
    ],
    note: "Это четыре сочетания по три разные травы. Ни одно не гарантирует, что руна сварится, и не обещает конкретный вид руны. Отмечай проверенные попытки, чтобы не ходить по кругу.",
  },
];

const resources = [
  { label: "Чугунный ключ", detail: "для входа" },
  { label: "3 угля", detail: "кузнецу" },
  { label: "3 железных руды", detail: "кузнецу" },
  { label: "3 дуба", detail: "кузнецу" },
  { label: "Сказочный гриб", detail: "у землероек, для Грибницы" },
  { label: "2 зверобоя лесного", detail: "для Грибницы" },
  { label: "3 папоротника", detail: "запас на четыре рецепта" },
  { label: "3 базилика", detail: "запас на четыре рецепта" },
  { label: "3 розмарина", detail: "запас на четыре рецепта" },
  { label: "3 корня мандрагоры", detail: "запас на четыре рецепта" },
];

const recipes = [
  "Папоротник + базилик + розмарин",
  "Папоротник + базилик + корень мандрагоры",
  "Папоротник + розмарин + корень мандрагоры",
  "Базилик + розмарин + корень мандрагоры",
];

export default function TombGuide() {
  const [stage, setStage] = useState(0);
  const [checked, setChecked] = useState<boolean[]>(() => resources.map(() => false));
  const [tried, setTried] = useState<boolean[]>(() => recipes.map(() => false));
  const [zoomed, setZoomed] = useState<Shot | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const index = chapters.findIndex((chapter) => chapter.id === hash);
      if (index !== -1) setStage(index);
      try {
        const saved = JSON.parse(localStorage.getItem("vampire-tomb-resources") || "null");
        if (Array.isArray(saved) && saved.length === resources.length && saved.every((item) => typeof item === "boolean")) setChecked(saved);
        const savedRecipes = JSON.parse(localStorage.getItem("vampire-tomb-recipes") || "null");
        if (Array.isArray(savedRecipes) && savedRecipes.length === recipes.length && savedRecipes.every((item) => typeof item === "boolean")) setTried(savedRecipes);
      } catch { /* The guide still works when storage is unavailable. */ }
    });
    const onHashChange = () => {
      const found = chapters.findIndex((chapter) => chapter.id === decodeURIComponent(window.location.hash.slice(1)));
      if (found !== -1) setStage(found);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => { active = false; window.removeEventListener("hashchange", onHashChange); };
  }, []);

  useEffect(() => {
    if (!zoomed) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setZoomed(null); };
    document.addEventListener("keydown", close);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = previous; };
  }, [zoomed]);

  const goTo = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    setStage(index);
    history.replaceState(null, "", `#${chapters[index].id}`);
    heading.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => heading.current?.focus({ preventScroll: true }), 100);
  };

  const toggleResource = (index: number) => {
    const updated = checked.map((value, i) => i === index ? !value : value);
    setChecked(updated);
    try { localStorage.setItem("vampire-tomb-resources", JSON.stringify(updated)); } catch { /* Storage is optional. */ }
  };

  const toggleRecipe = (index: number) => {
    const updated = tried.map((value, i) => i === index ? !value : value);
    setTried(updated);
    try { localStorage.setItem("vampire-tomb-recipes", JSON.stringify(updated)); } catch { /* Storage is optional. */ }
  };

  const current = chapters[stage];
  return (
    <>
      <aside className={styles.supplies} aria-label="Ресурсы для маршрута">
        <div>
          <p className={styles.kicker}>Перед входом и по дороге</p>
          <h2>Что понадобится</h2>
          <p>Отмечай добытое. Список сохранится на этом устройстве.</p>
        </div>
        <div className={styles.resourceGrid}>
          {resources.map((item, index) => (
            <label key={item.label} className={`${styles.resource} ${checked[index] ? styles.done : ""}`}>
              <input type="checkbox" checked={checked[index]} onChange={() => toggleResource(index)} />
              <span><strong>{item.label}</strong><small>{item.detail}</small></span>
            </label>
          ))}
        </div>
        <p className={styles.extra}>Кузнец делает 2 болта за один набор из 3 угля, 3 руды и 3 дуба. Для новых попыток этот набор понадобится снова. Для четырёх вариантов варки лучше взять по 3 травки каждого вида, всего 12.</p>
      </aside>

      <nav className={styles.stageNav} aria-label="Этапы прохождения">
        {chapters.map((chapter, index) => (
          <button key={chapter.id} type="button" aria-current={stage === index ? "step" : undefined} onClick={() => goTo(index)} className={stage === index ? styles.activeStage : ""}>
            <span>{String(index + 1).padStart(2, "0")}</span>{chapter.short}
          </button>
        ))}
      </nav>

      <section className={styles.chapter} aria-labelledby="stage-heading">
        <div className={styles.chapterHead}>
          <span>Этап {stage + 1} из {chapters.length}</span>
          <h2 id="stage-heading" ref={heading} tabIndex={-1}>{current.title}</h2>
          <p>{current.lead}</p>
        </div>
        <ol className={styles.shots} start={current.shots[0].number}>
          {current.shots.map((shot) => (
            <li key={shot.number} className={styles.step}>
              <div className={styles.stepCopy}>
                <span className={styles.stepNumber}>Скрин {shot.number}</span>
                <h3>{shot.caption}</h3>
                <p>{shot.text}</p>
              </div>
              <figure>
                <button type="button" className={styles.imageButton} onClick={() => setZoomed(shot)} aria-label={`Увеличить скрин ${shot.number}: ${shot.caption}`}>
                  {/* Preserve the original game UI pixels, including small text. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/vampire-tomb/${String(shot.number).padStart(2, "0")}.jpg`} alt={shot.alt || shot.caption} loading={shot.number === 1 ? "eager" : "lazy"} decoding="async" />
                </button>
                <figcaption>Нажми на скрин, чтобы увеличить</figcaption>
              </figure>
            </li>
          ))}
        </ol>
        {current.id === "alchemy" && (
          <div className={styles.recipes}>
            <h3>Отмечай уже проверенные рецепты</h3>
            <p>В каждом варианте три разные травы. Если руна не сварилась, ставь галочку и пробуй следующий. Отметки сохранятся на этом устройстве.</p>
            <div className={styles.recipeGrid}>
              {recipes.map((recipe, index) => (
                <label key={recipe} className={tried[index] ? styles.done : ""}>
                  <input type="checkbox" checked={tried[index]} onChange={() => toggleRecipe(index)} />
                  <span><b>{index + 1}.</b> {recipe}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {current.note && <p className={styles.note}>{current.note}</p>}
        {current.id === "alchemy" && <p className={styles.farewell}>В общем, пробуй, удачи! P.S. Как ты мог уже догадаться, аббревиатуры ПМБ, ПМР, ПБР, МБР - это как раз варианты сочетаний травок ;) Всё, пока, играйся))</p>}
        <div className={styles.controls}>
          <button type="button" onClick={() => goTo(stage - 1)} disabled={stage === 0}>← Назад</button>
          <span>{stage + 1} / {chapters.length}</span>
          <button type="button" onClick={() => goTo(stage + 1)} disabled={stage === chapters.length - 1}>Дальше →</button>
        </div>
      </section>

      {zoomed && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`Скрин ${zoomed.number}: ${zoomed.caption}`} onClick={() => setZoomed(null)}>
          <button type="button" className={styles.close} onClick={() => setZoomed(null)} aria-label="Закрыть скрин">×</button>
          <div className={styles.lightboxScroll} onClick={(event) => event.stopPropagation()}>
            {/* The enlarged view uses the original screenshot without resizing. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/vampire-tomb/${String(zoomed.number).padStart(2, "0")}.jpg`} alt={zoomed.alt || zoomed.caption} />
          </div>
        </div>
      )}
    </>
  );
}
