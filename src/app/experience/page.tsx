"use client";

import { useMemo, useState } from "react";
import {
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

  function handleChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setInput(digits ? Number(digits).toLocaleString("ru-RU") : "");
  }

  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-muted mb-3">
          Полезное и очень даже нужное :)
        </p>

        <h1 className="inner-page-title text-3xl font-black tracking-tight">
          Калькулятор и таблица опыта
        </h1>

        <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
          Узнай свой ап и посчитай, сколько осталось до следующего апа и нового уровня.
        </p>

        <div className="divider-accent mt-7" />
      </div>

      <section className="glass rounded-[26px] p-6 md:p-8 mb-7">
        <label htmlFor="experience" className="block mb-3 font-black text-ink">
          Сколько у тебя опыта?
        </label>

        <input
          id="experience"
          inputMode="numeric"
          value={input}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Например: 70 874 522"
          className="w-full rounded-2xl border border-black/10 bg-white/75 px-5 py-4 text-xl md:text-2xl font-black text-ink outline-none focus:border-accent/60 focus:ring-4 focus:ring-accent/10"
        />

        <div className="mt-6" aria-live="polite">
          <p className="text-xl md:text-2xl text-ink">
            Ты сейчас на <strong>{progress.level} уровне</strong>,{" "}
            <strong>{progress.up} апе</strong>
          </p>

          <div className="h-3 my-5 overflow-hidden rounded-full bg-black/10">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#7f4e16] to-[#c18a3e] transition-[width] duration-200"
              style={{ width: `${progress.stageProgress}%` }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/45 border border-black/5 p-5">
              <span className="block text-sm text-ink-muted mb-2">
                До следующего апа
              </span>
              <strong className="text-xl text-ink">
                {progress.toNextUp == null
                  ? "Таблица закончилась :)"
                  : formatNumber(progress.toNextUp)}
              </strong>
            </div>

            <div className="rounded-2xl bg-white/45 border border-black/5 p-5">
              <span className="block text-sm text-ink-muted mb-2">
                До {progress.level + 1} уровня
              </span>
              <strong className="text-xl text-ink">
                {progress.toNextLevel == null
                  ? "Максимальный уровень в таблице"
                  : formatNumber(progress.toNextLevel)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="glass rounded-[26px] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-muted mb-2">
              Все пороги
            </p>
            <h2 className="inner-page-title text-2xl font-black tracking-tight">
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

        <div className="overflow-x-auto rounded-2xl border border-black/10">
          <table className="w-full border-collapse bg-white/35">
            <thead>
              <tr className="bg-black/[0.06]">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-ink-muted">Уровень</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-ink-muted">Ап</th>
                <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-ink-muted">Нужно опыта</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIENCE_STAGES.map((stage) => (
                <tr
                  key={`${stage.level}-${stage.up}`}
                  className={stage.up === 0 ? "border-t-2 border-accent/35 bg-accent/[0.06] font-bold" : "border-t border-black/[0.07]"}
                >
                  <td className="px-4 py-3 text-ink">{stage.level}</td>
                  <td className="px-4 py-3 text-ink">{stage.up}</td>
                  <td className="px-4 py-3 text-right text-ink whitespace-nowrap">
                    {formatNumber(stage.experience)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
