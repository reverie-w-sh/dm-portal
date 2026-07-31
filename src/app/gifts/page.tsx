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
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-[#e6e6e6] tracking-tight">
        Подарки
      </h1>

      <p className="text-[#b9bec6] text-sm mt-1 mb-8">
        Сначала тут были только клановые подарочки с волчатами для Волчат🐺. Но по многочисленной просьбе добавлены разные картинки из интернета, приведенные к нужному подарочковому размеру, которыми может воспользоваться каждый желающий) Дарите на здороье)) кроме личных, их нельзя дарить, вы там поймете, о чем я) 
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
            <div className="w-full h-36 rounded-xl bg-[#cec8bf] border border-[#a99e91] flex items-center justify-center mb-4">
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
                Приватный, не надо его скачивать :)
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
