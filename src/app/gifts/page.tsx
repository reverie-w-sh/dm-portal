const gifts = [
  { title: "Ауф!", url: "https://dm-game.com//layout//all//subject//present/self/98.gif" },
  { title: "Волк", url: "https://dm-game.com//layout//all//subject//present/self/volchara.gif" },
  { title: "Волк одиночка", url: "https://dm-game.com//layout//all//subject//present/self/97.gif" },
  { title: "Вою на луну", url: "https://dm-game.com//layout//all//subject//present/self/nalunu.gif" },
  { title: "Оборотень", url: "https://dm-game.com//layout//all//subject//present/self/99.gif" },
  { title: "Любовь у волков", url: "https://dm-game.com//layout//all//subject//present/self/uvolkov.gif" },
  { title: "Подарок 1", url: "https://dm-game.com//layout//all//subject//present/self/clan212/clan2.gif" },
  { title: "Подарок 2", url: "https://dm-game.com//layout//all//subject//present/self/clan212/clan4.png" },
  { title: "Подарок 3", url: "https://dm-game.com//layout//all//subject//present/self/4394/57.gif" },
  { title: "Подарок 4", url: "https://dm-game.com//layout//all//subject//present/self/4394/56.gif" },
];

export default function GiftsPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-[#e6e6e6] tracking-tight">
        Подарки
      </h1>

      <p className="text-[#b9bec6] text-sm mt-1 mb-8">
        Клановые подарочки
      </p>

      <div className="glass rounded-2xl p-5 mb-8">
        <h2 className="text-lg font-bold text-ink mb-3">
          Как заказать подарок
        </h2>

        <ol className="list-decimal ml-5 space-y-2 text-sm text-ink-dim">
          <li>На счёте должно быть не менее <strong>3 ТГ</strong>.</li>
          <li>
            Перейдите в{" "}
            <a
              href="https://dm-game.com/index.php?file=com_otdel&mode=PresentSelf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-semibold hover:underline"
            >
              Услуги комотдела → Личные подарки
            </a>.
          </li>
          <li>Загрузите выбранный подарок.</li>
        </ol>
      </div>

      <div className="grid gap-4">
        {gifts.map((gift) => (
          <div
            key={gift.url}
            className="glass glass-hover rounded-2xl p-5 flex items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-20 rounded-xl bg-[#d3d3d3] border border-black/10 flex items-center justify-center shrink-0">
                <img
                  src={gift.url}
                  alt={gift.title}
                  className="max-w-[72px] max-h-[72px] object-contain clan-icon"
                />
              </div>

              <div className="min-w-0">
                <div className="font-semibold text-ink">
                  {gift.title}
                </div>
              </div>
            </div>

            <a
              href={gift.url}
              download
              className="btn-primary shrink-0"
            >
              Скачать
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
