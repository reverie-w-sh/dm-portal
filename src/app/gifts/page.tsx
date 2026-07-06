export default function GiftsPage() {
  const gifts = [
    { title: "Ауф!", file: "/gifts/auf.gif" },
    { title: "Волчара", file: "/gifts/wolf.gif" },
    { title: "Волк-одиночка", file: "/gifts/lone-wolf.gif" },
    { title: "Вою на луну", file: "/gifts/moon.gif" },
    { title: "Оборотень", file: "/gifts/werewolf.gif" },
    { title: "Любовь у волков", file: "/gifts/love.gif" },
    { title: "Волчица", file: "/gifts/Volchisa.gif" },
    { title: "Magic Wolf", file: "/gifts/MagicWolf.gif" },
    { title: "Лапка", file: "/gifts/lapka.gif" },
    { title: "Кофе", file: "/gifts/coffee.gif" },
    { title: "Лес", file: "/gifts/forest.png" },
    { title: "Обнимашки", file: "/gifts/hug.gif" },
    { title: "Обнимашки", file: "/gifts/hug1.gif" },
    { title: "Обнимашки", file: "/gifts/hug2.gif" },
    { title: "Обнимашки", file: "/gifts/hug3.gif" },
    { title: "Обнимашки", file: "/gifts/hug4.gif" },
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">

      <h1 className="text-3xl font-black text-[#e6e6e6] tracking-tight">
        Подарки
      </h1>

      <p className="text-[#b9bec6] text-sm mt-1 mb-8">
        Клановые подарочки
      </p>

      <div className="glass rounded-2xl p-6 mb-10">
        <h2 className="text-xl font-bold text-ink mb-4">
          Как заказать подарок
        </h2>

        <ol className="list-decimal ml-5 space-y-2 text-sm text-ink-dim">
          
          <li>Скачайте понравившийся подарок на этой страничке.</li>

          <li>Загрузите его в игре:</li>

          <li>
            Перейдите в раздел{" "}
            <a
              href="https://dm-game.com/index.php?file=com_otdel&mode=PresentSelf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline font-semibold"
            >
              Услуги комотдела → Личные подарки
            </a>
          </li>
          
          <li>На вашем счёте должно быть минимум <b>3 ТГ</b>. Размер подарка должен быть 60х60px</li>
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

            <div className="text-center font-semibold text-ink mb-4">
              {gift.title}
            </div>

            <a
              href={gift.file}
              download
              className="btn-primary w-full text-center"
            >
              ⬇ Скачать
            </a>

          </div>

        ))}

      </div>

    </div>
  );
}
