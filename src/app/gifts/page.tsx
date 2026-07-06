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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift) => (
          <a
            key={gift.url}
            href={gift.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-hover rounded-2xl p-5 flex items-center gap-4"
          >
            <img
              src={gift.url}
              alt={gift.title}
              className="w-16 h-16 object-contain clan-icon shrink-0"
            />

            <span className="text-ink font-semibold">
              {gift.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
