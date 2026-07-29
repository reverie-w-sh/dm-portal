"use client";

import { useMemo, useState } from "react";
import {
  EXPERIENCE_STAGES,
  getExperienceProgress,
} from "@/lib/experience";
import styles from "./page.module.css";

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
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Полезное и очень даже нужное :)</p>
          <h1>Калькулятор и таблица опыта</h1>
          <p>
            Узнай свой ап / посчитай, сколько осталось до следующего апа и
            нового уровня.
          </p>
        </header>

        <section className={styles.calculator}>
          <label htmlFor="experience">Сколько у тебя опыта?</label>
          <div className={styles.inputRow}>
            <input
              id="experience"
              inputMode="numeric"
              value={input}
              onChange={(event) => handleChange(event.target.value)}
              placeholder="Например: 70 874 522"
            />
          </div>

          <div className={styles.result} aria-live="polite">
            <p className={styles.now}>
              Ты сейчас на <strong>{progress.level} уровне</strong>,{" "}
              <strong>{progress.up} апе</strong>
            </p>

            <div className={styles.progressTrack} aria-hidden="true">
              <span style={{ width: `${progress.stageProgress}%` }} />
            </div>

            <div className={styles.stats}>
              <div>
                <span>До следующего апа</span>
                <strong>
                  {progress.toNextUp == null
                    ? "Таблица закончилась :)"
                    : formatNumber(progress.toNextUp)}
                </strong>
              </div>
              <div>
                <span>До {progress.level + 1} уровня</span>
                <strong>
                  {progress.toNextLevel == null
                    ? "Максимальный уровень в таблице"
                    : formatNumber(progress.toNextLevel)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.tableSection}>
          <div className={styles.tableHead}>
            <div>
              <p className={styles.eyebrow}>Все пороги</p>
              <h2>Таблица опыта</h2>
            </div>
            <a
              href="https://dm-game.com/index.php?file=library&page=experience"
              target="_blank"
              rel="noreferrer"
            >
              Официальная таблица ↗
            </a>
          </div>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Уровень</th>
                  <th>Ап</th>
                  <th>Нужно опыта</th>
                </tr>
              </thead>
              <tbody>
                {EXPERIENCE_STAGES.map((stage) => (
                  <tr
                    key={`${stage.level}-${stage.up}`}
                    className={stage.up === 0 ? styles.levelStart : undefined}
                  >
                    <td>{stage.level}</td>
                    <td>{stage.up}</td>
                    <td>{formatNumber(stage.experience)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
