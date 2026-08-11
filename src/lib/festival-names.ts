type FestivalName = {
  short: string;
  chronicle: string;
};

const FESTIVAL_NAMES: Array<{
  types: string[];
  titlePattern: RegExp;
  name: FestivalName;
}> = [
  {
    types: ["fighters"],
    titlePattern: /бойц/iu,
    name: { short: "Бойцов", chronicle: "Фестиваль Бойцов" },
  },
  {
    types: ["andvari"],
    titlePattern: /андвари/iu,
    name: { short: "Андвари", chronicle: "Фестиваль Андвари" },
  },
  {
    types: ["gatherer"],
    titlePattern: /собирател/iu,
    name: { short: "Собирателя", chronicle: "Фестиваль Собирателя" },
  },
  {
    types: ["fisher"],
    titlePattern: /рыбак/iu,
    name: { short: "Рыбака", chronicle: "Фестиваль Рыбака" },
  },
  {
    types: ["labyrinth"],
    titlePattern: /лабиринт/iu,
    name: { short: "Лабиринта", chronicle: "Фестиваль Лабиринта" },
  },
  {
    types: ["hunter"],
    titlePattern: /охотник/iu,
    name: { short: "Охотника", chronicle: "Фестиваль Охотника" },
  },
  {
    types: ["blacksmith"],
    titlePattern: /кузнец/iu,
    name: { short: "Кузнеца", chronicle: "Фестиваль Кузнеца" },
  },
  {
    types: ["bouquets"],
    titlePattern: /любимых|цветов|букет/iu,
    name: { short: "Букетов", chronicle: "Фестиваль Букетов" },
  },
  {
    types: ["easter"],
    titlePattern: /крашен|пасхал/iu,
    name: { short: "Пасхальном", chronicle: "Пасхальный фестиваль" },
  },
];

function festivalName(title: string, festivalType?: string): FestivalName | undefined {
  const normalizedType = festivalType?.trim().toLocaleLowerCase("ru-RU");
  return FESTIVAL_NAMES.find(
    (item) =>
      (normalizedType ? item.types.includes(normalizedType) : false) ||
      item.titlePattern.test(title),
  )?.name;
}

export function shortFestivalName(title: string, festivalType?: string): string | undefined {
  return festivalName(title, festivalType)?.short;
}

export function chronicleFestivalTitle(title: string, festivalType?: string): string {
  return festivalName(title, festivalType)?.chronicle ?? title;
}
