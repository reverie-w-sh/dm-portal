import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1180px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6">
          <img
            src="/icons/clan-paw.gif"
            alt=""
            className="mx-auto h-[19px] w-[19px]"
          />
        </div>

        <h1 className="text-5xl font-black tracking-wide text-[#e6e6e6] sm:text-7xl">
          die Wölfchen
        </h1>

        <p className="mt-4 text-xl text-[#b9bec6]">
          Волчата Древнего Мира
        </p>

        <div className="mt-8 h-px w-full max-w-md bg-gradient-to-r from-transparent via-[#555b64] to-transparent" />

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <Link href="/members" className="glass glass-hover rounded-2xl p-6">
            <div className="text-lg font-bold text-ink">
              Состав клана
            </div>
            <div className="mt-2 text-sm text-ink-dim">
              Волчата, роли и уровни
            </div>
          </Link>

          <Link href="/clans" className="glass glass-hover rounded-2xl p-6">
            <div className="text-lg font-bold text-ink">
              Другие кланы ДМ
            </div>
            <div className="mt-2 text-sm text-ink-dim">
              Списки и составы кланов
            </div>
          </Link>

          <Link href="/gifts" className="glass glass-hover rounded-2xl p-6">
            <div className="text-lg font-bold text-ink">
              Подарочки
            </div>
            <div className="mt-2 text-sm text-ink-dim">
              Клановые подарки для игры
            </div>
          </Link>

          <Link href="/links" className="glass glass-hover rounded-2xl p-6">
            <div className="text-lg font-bold text-ink">
              Что-то полезное
            </div>
            <div className="mt-2 text-sm text-ink-dim">
              Скрипты, ссылки и разности
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
