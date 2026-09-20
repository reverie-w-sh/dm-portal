export type WorldLocation = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  image?: string;
  guideHref?: string;
  guideLabel?: string;
  mapPoint?: { x: number; y: number };
};

export type WorldStep = {
  from: string;
  to: string;
  instruction: string;
};

type WorldEdge = {
  from: string;
  to: string;
  forward: string;
  backward: string;
};

export const WORLD_LOCATIONS: WorldLocation[] = [
  { id: "home", slug: "home", name: "Дом", description: "Дом персонажа, удобная начальная точка для всех маршрутов.", image: "/images/world/locations/home.jpg", mapPoint: { x: 58, y: 59 } },
  { id: "central", slug: "central-square", name: "Центральная площадь", description: "Главная площадь города. Отсюда можно пройти к Площади шахтёров или на Улицу гладиаторов.", image: "/images/world/locations/central-square.jpg", mapPoint: { x: 61, y: 51 } },
  { id: "shop", slug: "shop", name: "Лавка", description: "Городская лавка на Центральной площади.", image: "/images/world/locations/shop.jpg", mapPoint: { x: 56, y: 44 } },
  { id: "alchemist", slug: "alchemist", name: "Алхимик", description: "Алхимическая лавка на Центральной площади.", image: "/images/world/locations/alchemist.jpg", mapPoint: { x: 57, y: 48 } },
  { id: "market", slug: "market", name: "Рынок", description: "Городской рынок и торговые разделы.", image: "/images/world/locations/market.jpg", mapPoint: { x: 63, y: 43 } },
  { id: "royal-shop", slug: "royal-shop", name: "Королевская лавка", shortName: "Кор. лавка", description: "Королевская лавка на Центральной площади.", image: "/images/world/locations/royal-shop.jpg", mapPoint: { x: 67, y: 47 } },

  { id: "miners", slug: "miners-square", name: "Площадь шахтёров", description: "Каменная площадь между Центральной площадью и дорогой к озеру.", image: "/images/world/locations/miners-square.jpg", mapPoint: { x: 41, y: 25 } },
  { id: "donor", slug: "donor-search", name: "Поиск донора", description: "Сервис поиска донора на Площади шахтёров.", image: "/images/world/locations/donor-search.jpg", mapPoint: { x: 34, y: 23 } },
  { id: "farm", slug: "farm", name: "Ферма", description: "Ферма возле Площади шахтёров.", mapPoint: { x: 44, y: 20 } },
  { id: "blood", slug: "blood-dungeon", name: "Кровавое подземелье", shortName: "Дом Боли", description: "Кровавое подземелье, также известное как Дом Боли.", image: "/images/world/locations/blood-dungeon.jpg", guideHref: "/dom-boli", guideLabel: "Открыть карты Дома Боли", mapPoint: { x: 36, y: 17 } },
  { id: "vampire-tomb", slug: "vampire-tomb", name: "Гробница вампиров", shortName: "Гробница", description: "Сюда ходят, чтобы варить руны... Позже напишу подробнее :)", mapPoint: { x: 47, y: 20 } },

  { id: "lake-road", slug: "lake-road", name: "Дорога к озеру", description: "Зелёный перекрёсток между пустыней, Площадью шахтёров, лесом, охотой и озером.", image: "/images/world/locations/lake-road.jpg", mapPoint: { x: 28, y: 50 } },
  { id: "memory-tree", slug: "memory-tree", name: "Древо памяти", description: "Памятное дерево возле дороги к озеру. Здесь можно вырастить своё яблоко и получить доступ к загрузке фотографий в галерею.", image: "/images/world/locations/memory-tree.jpg", mapPoint: { x: 24, y: 43 } },
  { id: "fisher-road", slug: "fisher-road", name: "Путь рыбака", description: "Лесная дорога, ведущая к озеру.", image: "/images/world/locations/fisher-road.jpg", mapPoint: { x: 22, y: 59 } },
  { id: "fish-shop", slug: "fish-shop", name: "Рыбная лавка", description: "Рыбная лавка на пути к озеру.", mapPoint: { x: 18, y: 65 } },
  { id: "lake", slug: "lake", name: "Озеро", description: "Место рыбалки на светлом лесном озере.", image: "/images/world/locations/lake.jpg", mapPoint: { x: 27, y: 67 } },
  { id: "forest", slug: "enchanted-forest", name: "Зачарованный лес", description: "Тёмный зачарованный лес возле дороги к озеру.", image: "/images/world/locations/enchanted-forest.jpg", mapPoint: { x: 35, y: 71 } },
  { id: "hunting", slug: "hunting-grounds", name: "Охотничьи угодья", description: "", image: "/images/world/locations/hunting-grounds.jpg", guideHref: "/hunter-guide", guideLabel: "Открыть гайд по охоте", mapPoint: { x: 43, y: 73 } },
  { id: "desert", slug: "desert", name: "Пустыня", description: "Дальняя западная область мира за дорогой к озеру.", image: "/images/world/locations/desert.jpg", mapPoint: { x: 8, y: 55 } },

  { id: "gladiators", slug: "gladiators-street", name: "Улица гладиаторов", description: "Восточная часть города с Мэрией, Трактиром, Колизеем, Осадами и Мастерской.", image: "/images/world/locations/gladiators-street.jpg", mapPoint: { x: 85, y: 52 } },
  { id: "city-hall", slug: "city-hall", name: "Мэрия", description: "Здесь находятся хранилища сообществ и альянсов, Возрождение и Бракосочетания.", image: "/images/world/locations/city-hall.jpg", mapPoint: { x: 79, y: 47 } },
  { id: "tavern", slug: "tavern", name: "Трактир", description: "Трактир на Улице гладиаторов.", image: "/images/world/locations/tavern.jpg", mapPoint: { x: 81, y: 56 } },
  { id: "colosseum", slug: "colosseum", name: "Колизей", description: "Боевой район Улицы гладиаторов. Здесь находятся Арена гладиаторов, Бестиарий и Бои сообществ.", image: "/images/world/locations/colosseum.jpg", mapPoint: { x: 91, y: 43 } },
  { id: "arena", slug: "arena", name: "Арена гладиаторов", shortName: "Арена", description: "PvP-локация, где игроки сражаются друг с другом.", image: "/images/world/locations/arena.jpg", mapPoint: { x: 94, y: 35 } },
  { id: "bestiary", slug: "bestiary", name: "Бестиарий", description: "Бои с монстрами. Скучно, но что поделать... Мы ходим туда ради опыта и дропа.", image: "/images/world/locations/bestiary.jpg", mapPoint: { x: 91, y: 39 } },
  { id: "community-battles", slug: "community-battles", name: "Бои сообществ", shortName: "Бои сообществ", description: "Ещё одна покрытая пылью локация...", image: "/images/world/locations/community-battles.jpg", mapPoint: { x: 96, y: 44 } },
  { id: "sieges", slug: "sieges", name: "Осады", description: "Осадный район и начало пути к Серой Пещере.", image: "/images/world/locations/sieges.jpg", mapPoint: { x: 90, y: 61 } },
  { id: "towers", slug: "siege-tower", name: "Башня Познания", shortName: "Башня", description: "Башня сообщества, которая увеличивает опыт во всех боях.", image: "/images/world/locations/towers.jpg", mapPoint: { x: 95, y: 67 } },
  { id: "workshop", slug: "workshop", name: "Мастерская", description: "Ремонт, гравировка, крафт и кожевничество.", image: "/images/world/locations/workshop.jpg", mapPoint: { x: 84, y: 67 } },

  { id: "cave-road", slug: "cave-road", name: "Дорога к Пещерам", description: "Дорога от города к пещере с Подземным озером, Лабиринтом и прочими подземельями.", image: "/images/world/locations/cave-road.jpg", mapPoint: { x: 82, y: 28 } },
  { id: "grey-cave", slug: "grey-cave", name: "Серая Пещера", description: "Главный вход в пещерный комплекс.", image: "/images/world/locations/grey-cave.jpg", mapPoint: { x: 73, y: 13 } },
  { id: "guardian", slug: "guardian", name: "Хранитель", description: "Комната Хранителя в Серой Пещере.", image: "/images/world/locations/guardian.jpg", mapPoint: { x: 79, y: 10 } },
  { id: "labyrinth", slug: "labyrinth", name: "Лабиринт", description: "Прямой проход из Серой Пещеры.", image: "/images/world/locations/labyrinth.jpg", mapPoint: { x: 73, y: 6 } },
  { id: "underground-lake", slug: "underground-lake", name: "Подземное озеро", shortName: "Подз. озеро", description: "Подземное озеро в Серой Пещере.", image: "/images/world/locations/underground-lake.jpg", mapPoint: { x: 69, y: 10 } },
  { id: "rift", slug: "rift", name: "Расщелина", description: "Перекрёсток трёх больших подземелий.", image: "/images/world/locations/rift.jpg", guideHref: "/dungeons", guideLabel: "Открыть карты подземелий", mapPoint: { x: 62, y: 14 } },
  { id: "malachite", slug: "malachite-mines", name: "Малахитовые Рудники", shortName: "Рудники", description: "Подземелье Малахитовые Рудники.", guideHref: "/malahitovye-rudniki", guideLabel: "Открыть карту Рудников", mapPoint: { x: 53, y: 10 } },
  { id: "garden", slug: "garden-of-nightmares", name: "Сад Кошмаров", shortName: "Сад Кошмаров", description: "Подземелье Сад Кошмаров.", guideHref: "/sad-koshmarov", guideLabel: "Открыть карту Сада", mapPoint: { x: 59, y: 6 } },
  { id: "shadow-forest", slug: "shadow-forest", name: "Лес Теней", description: "Подземелье Лес Теней.", guideHref: "/les-teney", guideLabel: "Открыть карту Леса Теней", mapPoint: { x: 64, y: 8 } },
];

const WORLD_EDGES: WorldEdge[] = [
  { from: "home", to: "central", forward: "В Доме нажми «Центральная площадь».", backward: "На Центральной площади нажми «Дом»." },
  { from: "central", to: "shop", forward: "На Центральной площади нажми «Лавка».", backward: "Выйди из Лавки на Центральную площадь." },
  { from: "central", to: "alchemist", forward: "На Центральной площади нажми «Алхимик».", backward: "Выйди от Алхимика на Центральную площадь." },
  { from: "central", to: "market", forward: "На Центральной площади нажми «Рынок».", backward: "Выйди с Рынка на Центральную площадь." },
  { from: "central", to: "royal-shop", forward: "На Центральной площади нажми «Королевская лавка».", backward: "Выйди из Королевской лавки на Центральную площадь." },
  { from: "central", to: "miners", forward: "На Центральной площади нажми стрелку влево, на Площадь шахтёров.", backward: "На Площади шахтёров нажми стрелку вправо, на Центральную площадь." },
  { from: "miners", to: "donor", forward: "На Площади шахтёров нажми «Поиск донора».", backward: "Вернись на Площадь шахтёров." },
  { from: "miners", to: "farm", forward: "На Площади шахтёров нажми «Ферма».", backward: "С Фермы вернись на Площадь шахтёров." },
  { from: "miners", to: "blood", forward: "На Площади шахтёров нажми «Кровавое подземелье».", backward: "Выйди из Кровавого подземелья на Площадь шахтёров." },
  { from: "miners", to: "vampire-tomb", forward: "На Площади шахтёров нажми «Гробница Вампиров».", backward: "Выйди из Гробницы вампиров на Площадь шахтёров." },
  { from: "miners", to: "lake-road", forward: "На Площади шахтёров нажми стрелку влево, на Дорогу к озеру.", backward: "На Дороге к озеру нажми стрелку вправо, на Площадь шахтёров." },
  { from: "lake-road", to: "memory-tree", forward: "На Дороге к озеру нажми «Древо памяти».", backward: "От Древа памяти вернись на Дорогу к озеру." },
  { from: "lake-road", to: "fisher-road", forward: "На Дороге к озеру нажми «Дорога к озеру».", backward: "На лесной дороге нажми стрелку вправо." },
  { from: "fisher-road", to: "fish-shop", forward: "На лесной дороге нажми «Рыбная лавка».", backward: "Выйди из Рыбной лавки на лесную дорогу." },
  { from: "fisher-road", to: "lake", forward: "На лесной дороге нажми «Озеро».", backward: "На Озере нажми стрелку вправо." },
  { from: "lake-road", to: "forest", forward: "На Дороге к озеру нажми «Зачарованный лес».", backward: "Из Зачарованного леса вернись на Дорогу к озеру." },
  { from: "lake-road", to: "hunting", forward: "На Дороге к озеру нажми «Охотничьи угодья».", backward: "Из Охотничьих угодий вернись на Дорогу к озеру." },
  { from: "lake-road", to: "desert", forward: "На Дороге к озеру нажми стрелку влево, в Пустыню.", backward: "В любой Пустыне нажми стрелку вправо, чтобы выйти на Дорогу к озеру." },
  { from: "central", to: "gladiators", forward: "На Центральной площади нажми стрелку вправо, на Улицу гладиаторов.", backward: "На Улице гладиаторов нажми стрелку влево, на Центральную площадь." },
  { from: "gladiators", to: "city-hall", forward: "На Улице гладиаторов нажми «Мэрия».", backward: "Выйди из Мэрии на Улицу гладиаторов." },
  { from: "gladiators", to: "tavern", forward: "На Улице гладиаторов нажми «Трактир».", backward: "Выйди из Трактира на Улицу гладиаторов." },
  { from: "gladiators", to: "colosseum", forward: "На Улице гладиаторов нажми «Колизей».", backward: "Из Колизея вернись на Улицу гладиаторов." },
  { from: "colosseum", to: "arena", forward: "В Колизее выбери «Арена гладиаторов».", backward: "Вернись с Арены в Колизей." },
  { from: "colosseum", to: "bestiary", forward: "В Колизее выбери «Бестиарий».", backward: "Вернись из Бестиария в Колизей." },
  { from: "colosseum", to: "community-battles", forward: "В Колизее выбери «Бои сообществ».", backward: "Вернись из Боёв сообществ в Колизей." },
  { from: "gladiators", to: "sieges", forward: "На Улице гладиаторов нажми «Осады».", backward: "Из Осад вернись на Улицу гладиаторов." },
  { from: "sieges", to: "towers", forward: "В разделе Осад открой «Башню Познания».", backward: "Из Башни Познания вернись в Осады." },
  { from: "gladiators", to: "workshop", forward: "На Улице гладиаторов нажми «Мастерская».", backward: "Из Мастерской вернись на Улицу гладиаторов." },
  { from: "sieges", to: "cave-road", forward: "Из района Осад выйди на Дорогу к Пещерам.", backward: "По Дороге к Пещерам вернись к Осадному району." },
  { from: "cave-road", to: "grey-cave", forward: "Пройди по Дороге к Пещерам до входа в Серую Пещеру.", backward: "Выйди из Серой Пещеры на Дорогу к Пещерам." },
  { from: "grey-cave", to: "guardian", forward: "В Серой Пещере поверни направо, к Хранителю.", backward: "От Хранителя вернись в Серую Пещеру." },
  { from: "grey-cave", to: "labyrinth", forward: "В Серой Пещере иди прямо, в Лабиринт.", backward: "Из Лабиринта вернись в Серую Пещеру." },
  { from: "grey-cave", to: "underground-lake", forward: "В Серой Пещере выбери «Подземное озеро».", backward: "С Подземного озера вернись в Серую Пещеру." },
  { from: "grey-cave", to: "rift", forward: "В Серой Пещере поверни налево, к большим подземельям через Расщелину.", backward: "Из Расщелины вернись в Серую Пещеру." },
  { from: "rift", to: "malachite", forward: "В Расщелине выбери «Малахитовый рудник».", backward: "Выйди из Малахитовых Рудников в Расщелину." },
  { from: "rift", to: "garden", forward: "В Расщелине выбери «Сад кошмаров».", backward: "Выйди из Сада Кошмаров в Расщелину." },
  { from: "rift", to: "shadow-forest", forward: "В Расщелине выбери «Лес теней».", backward: "Выйди из Леса Теней в Расщелину." },
];

export const LOCATION_BY_ID = new Map(WORLD_LOCATIONS.map((location) => [location.id, location]));
export const LOCATION_BY_SLUG = new Map(WORLD_LOCATIONS.map((location) => [location.slug, location]));

export function findWorldRoute(from: string, to: string): WorldStep[] {
  if (from === to) return [];
  const queue: Array<{ id: string; steps: WorldStep[] }> = [{ id: from, steps: [] }];
  const seen = new Set([from]);

  while (queue.length) {
    const current = queue.shift();
    if (!current) break;

    for (const edge of WORLD_EDGES) {
      let next: string | null = null;
      let instruction = "";
      if (edge.from === current.id) {
        next = edge.to;
        instruction = edge.forward;
      } else if (edge.to === current.id) {
        next = edge.from;
        instruction = edge.backward;
      }
      if (!next || seen.has(next)) continue;

      const steps = [...current.steps, { from: current.id, to: next, instruction }];
      if (next === to) return steps;
      seen.add(next);
      queue.push({ id: next, steps });
    }
  }

  return [];
}

export function getNeighbours(id: string) {
  return WORLD_EDGES.flatMap((edge) => {
    if (edge.from === id) return [LOCATION_BY_ID.get(edge.to)].filter(Boolean) as WorldLocation[];
    if (edge.to === id) return [LOCATION_BY_ID.get(edge.from)].filter(Boolean) as WorldLocation[];
    return [];
  });
}
