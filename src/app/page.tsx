export default function Home() {
  return (
    <main className="min-h-screen bg-[#1b1e23] text-[#e6e6e6]">
      <section className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-3xl border border-[#3b414a] bg-[#252a31] px-10 py-14 shadow-2xl">
          <h1 className="text-5xl font-bold tracking-wide text-[#f0d991]">
            die Wölfchen
          </h1>

          <p className="mt-5 text-xl text-[#c9ced6]">
            Официальный сайт клана «Волчата»
          </p>

          <p className="mt-2 text-lg text-[#a7adb8]">
            браузерной игры «Древний Мир»
          </p>
        </div>
      </section>
    </main>
  );
}
