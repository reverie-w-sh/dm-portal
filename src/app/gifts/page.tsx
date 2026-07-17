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
    { title: "Кофе Волчонок 2 Подарок", file: "/gifts/coffee1.gif", personal: true  },
    { title: "Кофе Волчонок 3 Подарок", file: "/gifts/coffee2.gif", personal: true  },
    { title: "Кофе Томми 4 Подарок", file: "/gifts/coffee-tommy.gif", personal: true },
    { title: "Обнимашки Подарок)", file: "/gifts/hug.gif" },
    { title: "Лавочка с попкорном Подарок)", file: "/gifts/lavochka.gif" },
    { title: "Волчица Лени Подарок)", file: "/gifts/len-g.gif" },
    { title: "Волчонок-чеширский котик Подарок)", file: "/gifts/wolf-chechir-gift.gif" },
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-[#e6e6e6] tracking-tight">
        Подарки
      </h1>

      <p className="text-[#b9bec6] text-sm mt-1 mb-8">
        Клановые подарочки 🐺
      </p>

      <div className="glass rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold text-ink mb-4">
          Как заказать подарок
        </h2>

        <ol className="list-decimal ml-5 space-y-3 text-sm text-ink-dim">
          <li>Скачайте понравившийся подарок на этой странице.</li>

          <li>
            Загрузите его в игре:
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>
                Перейдите в раздел{" "}
                
                  <a href="https://dm-game.com/index.php?file=com_otdel&mode=PresentSelf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-semibold"
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {gifts.map((gift) => (
          <div
            key={gift.file}
            className="glass rounded-2xl p-5 flex flex-col items-center transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="w-full h-36 rounded-xl bg-[#d3d3d3] border border-black/10 flex items-center justify-center mb-4">
              <img
                src={gift.file}
                alt={gift.title}
                className="max-w-[110px] max-h-[110px] object-contain"
              />
            </div>

            {gift.personal ? (
              <button
                type="button"
                disabled
                className="w-full text-center rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-muted border border-white/10 cursor-not-allowed opacity-70"
              >
                Сорри, нельзя скачать :)
              </button>
            ) : (
              
              <a href={gift.file}
                download
                className="btn-primary w-full text-center"
              >
                ⬇ Скачать
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
