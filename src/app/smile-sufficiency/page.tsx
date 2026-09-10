"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import clansJson from "../../../data/clans.json";
import styles from "./page.module.css";

type Clan = {
  clanId: string;
  name: string;
  crestSmall?: string;
  smilesCount?: number;
};

const clans = [...(clansJson as Clan[])].sort((a, b) =>
  a.name.localeCompare(b.name, "ru", { sensitivity: "base" }),
);

const WOLFCHEN_ID = "278";
const WEREWOLVES_ID = "212";

function makeRecommendedDate() {
  const date = new Date();
  const monthsToAdd = 4 + Math.floor(Math.random() * 9);
  date.setMonth(date.getMonth() + monthsToAdd);
  date.setDate(1 + Math.floor(Math.random() * 27));
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SmileSufficiencyPage() {
  const [selectedId, setSelectedId] = useState("");
  const [recommendedDate, setRecommendedDate] = useState("");

  const clan = useMemo(
    () => clans.find((item) => item.clanId === selectedId) ?? null,
    [selectedId],
  );

  const isWolfchen = clan?.clanId === WOLFCHEN_ID;
  const isWerewolves = clan?.clanId === WEREWOLVES_ID;

  function selectClan(clanId: string) {
    setSelectedId(clanId);
    setRecommendedDate(
      clanId && clanId !== WOLFCHEN_ID && clanId !== WEREWOLVES_ID
        ? makeRecommendedDate()
        : "",
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.department}>КЛАНОВЫЙ ДИАГНОСТИЧЕСКИЙ ЦЕНТР</p>
          <div className={styles.titleRow}>
            <span />
            <h1>Определение уровня достаточности клановых смайлов</h1>
            <span />
          </div>
          <p className={styles.subtitle}>
            Автоматизированная система оценки смайликового фонда клана
          </p>
        </header>

        <div className={styles.controlPanel}>
          <label htmlFor="clan-select">Исследуемый клан</label>
          <div className={styles.selectWrap}>
            <select
              id="clan-select"
              value={selectedId}
              onChange={(event) => selectClan(event.target.value)}
            >
              <option value="">Выберите клан для проведения диагностики</option>
              {clans.map((item) => (
                <option key={item.clanId} value={item.clanId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <p className={styles.methodNote}>
            Методика: количественная оценка фонда с последующей автоматической интерпретацией результата.
          </p>
        </div>

        {!clan ? (
          <div className={styles.waiting}>
            <div className={styles.waitingMark}>⌁</div>
            <strong>Система готова к проведению исследования</strong>
            <span>Выберите клан из списка выше.</span>
          </div>
        ) : (
          <article
            className={`${styles.report} ${
              isWolfchen
                ? styles.criticalReport
                : isWerewolves
                  ? styles.excessReport
                  : ""
            }`}
          >
            <div className={styles.reportHead}>
              <div className={styles.clanIdentity}>
                {clan.crestSmall ? (
                  <span className={styles.crestWrap}>
                    <Image src={clan.crestSmall} alt="" width={36} height={36} unoptimized />
                  </span>
                ) : null}
                <div>
                  <span>Диагностическое заключение</span>
                  <h2>{clan.name}</h2>
                </div>
              </div>
              <span className={styles.protocol}>Протокол СМ-04</span>
            </div>

            <div className={styles.metrics}>
              <div>
                <span>Смайлов в фонде</span>
                <strong>{clan.smilesCount ?? 0}</strong>
              </div>
              <div>
                <span>Оценка состояния</span>
                <strong
                  className={
                    isWolfchen
                      ? styles.criticalText
                      : isWerewolves
                        ? styles.excessText
                        : styles.normalText
                  }
                >
                  {isWolfchen ? "КРИТИЧЕСКОЕ" : isWerewolves ? "ПЕРЕБОР" : "НОРМА"}
                </strong>
              </div>
            </div>

            <div className={styles.scaleBlock}>
              <div className={styles.scaleLabels}>
                <span>Критично</span>
                <span>Недостаточно</span>
                <span>Норма</span>
                <span>Избыток</span>
              </div>
              <div className={styles.scale}>
                <span
                  className={`${styles.pointer} ${
                    isWolfchen
                      ? styles.pointerCritical
                      : isWerewolves
                        ? styles.pointerExcess
                        : styles.pointerNormal
                  }`}
                />
              </div>
            </div>

            {isWolfchen ? (
              <div className={styles.criticalBox}>
                <div className={styles.warningIcon}>!</div>
                <div>
                  <p className={styles.warningLabel}>ВНИМАНИЕ</p>
                  <h3>ОСТРАЯ СМАЙЛИКОВАЯ НЕДОСТАТОЧНОСТЬ</h3>
                  <p>
                    Уровень смайликового обеспечения находится значительно ниже минимально допустимого для нормального функционирования клана.
                  </p>
                  <p className={styles.urgent}>Необходимо срочное пополнение смайликового фонда!</p>
                </div>
              </div>
            ) : isWerewolves ? (
              <div className={styles.excessBox}>
                <div className={styles.excessIcon}>!</div>
                <div>
                  <p className={styles.excessLabel}>ЗАКЛЮЧЕНИЕ</p>
                  <h3>СМАЙЛИКОВЫЙ ПЕРЕБОР</h3>
                  <p>
                    Количество смайлов превышает рекомендуемый уровень. Дальнейшее увеличение смайликового фонда признано системой нецелесообразным.
                  </p>
                  <p className={styles.neverAgain}>Рекомендуем больше никогда не добавлять смайлов.</p>
                  <div className={styles.recommendation}>
                    <span>Рекомендованная дата следующего пополнения</span>
                    <strong>Не требуется</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.conclusion}>
                <p className={styles.conclusionLabel}>Заключение</p>
                <h3>Вполне достаточно</h3>
                <p>
                  Текущий объём смайликового фонда находится в пределах нормы. Срочных мер не требуется.
                </p>
                <div className={styles.recommendation}>
                  <span>Рекомендованная дата следующего пополнения</span>
                  <strong>{recommendedDate}</strong>
                </div>
              </div>
            )}

            <footer className={styles.reportFooter}>
              <span>Результат сформирован автоматически</span>
              <strong>
                Рекомендация системы: {
                  isWolfchen
                    ? "пополнение требуется незамедлительно"
                    : isWerewolves
                      ? "дальнейшее пополнение категорически не рекомендуется"
                      : "плановое наблюдение"
                }
              </strong>
            </footer>
          </article>
        )}

        <p className={styles.disclaimer}>
          Диагностическая система прошла внутреннюю проверку и считает собственные выводы абсолютно объективными.
        </p>
      </section>
    </main>
  );
}
