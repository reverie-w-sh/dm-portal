"use client";

import { useMemo, useState } from "react";
import {
  BASE_EXPERIENCE_BY_LEVEL,
  EXPERIENCE_STAGES,
  getExperienceProgress,
} from "@/lib/experience";

const formatNumber = (value: number) => value.toLocaleString("ru-RU");

export default function ExperiencePage() {
  const [input, setInput] = useState("70 874 522");

  const numericExperience = useMemo(() => {
    const parsed = Number(input.replace(/\D/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [input]);

  const progress = useMemo(
    () => getExperienceProgress(numericExperience),
    [numericExperience],
  );

  const baseExperience = BASE_EXPERIENCE_BY_LEVEL[progress.level];
  const needed = (remaining: number | null, multiplier: number) => remaining == null || !baseExperience ? null : Math.ceil(remaining / (baseExperience * multiplier));

  function handleChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setInput(digits ? Number(digits).toLocaleString("ru-RU") : "");
  }

  return (
    <div
      className="min-h-screen px-3 py-5 sm:px-6 sm:py-8 text-[#e9dfcf]"
      style={{
        background:
          "radial-gradient(circle at 50% 0, rgba(116, 67, 22, .17), transparent 42rem), linear-gradient(180deg, #050707, #090b0b 50%, #050707)",
      }}
    >
    <div className="max-w-[1090px] mx-auto rounded-2xl border border-[#ad712261] bg-[rgba(5,7,7,.97)] p-4 sm:p-7">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a98249] mb-3">
          Полезное и очень даже нужное :)
        </p>

        <h1 className="text-3xl font-black tracking-tight text-[#e7ca91] opacity-60 drop-shadow-[0_2px_10px_rgba(0,0,0,.9)]">
          Калькулятор и таблица опыта
        </h1>

        <p className="text-[#bda888] mt-3 max-w-2xl leading-relaxed">
          Узнай свой ап и посчитай, сколько осталось до следующего апа и нового уровня.
        </p>

        <div className="divider-accent mt-7" />
      </div>

      <section className="rounded-2xl border border-[#ad71227a] bg-[#080a09] p-6 md:p-8 mb-7 shadow-[0_14px_36px_rgba(0,0,0,.32)]">
        <label htmlFor="experience" className="block mb-3 font-black text-[#ecd4a6]">
          Сколько у тебя опыта?
        </label>

        <input
          id="experience"
          inputMode="numeric"
          value={input}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Например: 70 874 522"
          className="w-full rounded-xl border border-[#ad712273] bg-[#0c0d0c] px-5 py-4 text-xl md:text-2xl font-black text-[#efd09a] placeholder:text-[#806f58] outline-none focus:border-[#d69938] focus:ring-4 focus:ring-[#ad712226]"
        />

        <div className="mt-6" aria-live="polite">
          <p className="text-xl md:text-2xl text-[#ecd4a6]">
            Ты сейчас на <strong>{progress.level} уровне</strong>,{" "}
            <strong>{progress.up} апе</strong>
          </p>

          <div className="h-3 my-5 overflow-hidden rounded-full border border-[#ad712252] bg-[#17120b]">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#7f4e16] to-[#c18a3e] transition-[width] duration-200"
              style={{ width: `${progress.stageProgress}%` }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#0b0d0c] border border-[#ad712252] p-5">
              <span className="block text-sm text-[#bda888] mb-2">
                До следующего апа
              </span>
              <strong className="text-xl text-[#efd09a]">
                {progress.toNextUp == null
                  ? "Таблица закончилась :)"
                  : formatNumber(progress.toNextUp)}
              </strong>
            </div>

            <div className="rounded-xl bg-[#0b0d0c] border border-[#ad712252] p-5">
              <span className="block text-sm text-[#bda888] mb-2">
                До {progress.level + 1} уровня
              </span>
              <strong className="text-xl text-[#efd09a]">
                {progress.toNextLevel == null
                  ? "Максимальный уровень в таблице"
                  : formatNumber(progress.toNextLevel)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section id="festival-experience" className="rounded-2xl border border-[#ad71227a] bg-[#080a09] p-6 md:p-8 mb-7 shadow-[0_14px_36px_rgba(0,0,0,.32)] scroll-mt-24">
        <h2 className="text-2xl font-black tracking-tight text-[#ecd4a6]">Сколько рыбок до апа?</h2>
        <p className="text-[#bda888] mt-2 mb-5">На {progress.level}-м уровне один базовый опыт равен {formatNumber(baseExperience)}. Золотая рыбка даёт три базовых опыта, а слива, кусочек мяса или шкурка андвари на фестивале — один. Считаем с округлением вверх: последняя награда может перекрыть остаток.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {([['До следующего апа', progress.toNextUp], [`До ${progress.level + 1} уровня`, progress.toNextLevel]] as const).map(([label, remaining]) => <div key={label} className="rounded-xl bg-[#0b0d0c] border border-[#ad712252] p-5">
            <h3 className="text-[#efd09a] font-bold mb-2">{label}</h3>
            {remaining == null ? <p className="text-[#bda888]">Таблица закончилась :)</p> : <><p>Золотых рыбок: <strong className="text-[#efd09a]">{formatNumber(needed(remaining, 3) ?? 0)}</strong></p><p>Слив, кусочков мяса или шкурок андвари: <strong className="text-[#efd09a]">{formatNumber(needed(remaining, 1) ?? 0)}</strong></p></>}
          </div>)}
        </div>
        <p className="text-sm text-[#a89679] mt-4">Расчёт по базовому опыту без дополнительных бонусов. Рыбку можно поймать по ежедневному заданию в <a href="/world/underground-lake" className="text-[#e5b65b] underline underline-offset-4">Подземном озере</a>.</p>
      </section>

      <section className="rounded-2xl border border-[#ad71227a] bg-[#080a09] p-6 md:p-8 shadow-[0_14px_36px_rgba(0,0,0,.32)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a98249] mb-2">
              Все пороги
            </p>
            <h2 className="text-2xl font-black tracking-tight text-[#ecd4a6]">
              Таблица опыта
            </h2>
          </div>

          <a
            href="https://dm-game.com/index.php?file=library&page=experience"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-bold text-accent hover:opacity-75 transition-opacity"
          >
            Официальная таблица ↗
          </a>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#ad712266]">
          <table className="w-full border-collapse bg-[#090c0b]">
            <thead>
              <tr className="bg-[#171109]">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#bda888]">Уровень</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-[#bda888]">Ап</th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-[#bda888]">Нужно опыта</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIENCE_STAGES.map((stage) => (
                <tr
                  key={`${stage.level}-${stage.up}`}
                  className={stage.up === 0 ? "border-t-2 border-[#b4772259] bg-[#6a3d121f] font-bold" : "border-t border-[#ad71222e]"}
                >
                  <td className="px-4 py-3 text-[#dfc38f]">{stage.level}</td>
                  <td className="px-4 py-3 text-[#dfc38f]">{stage.up}</td>
                  <td className="px-4 py-3 text-right text-[#dfc38f] whitespace-nowrap">
                    {formatNumber(stage.experience)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    </div>
  );
}
