"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import styles from "./AllianceInfoButton.module.css";

export type AllianceClanLink = {
  clanId: string;
  name: string;
  crestSmall?: string;
  icon?: string;
};

type AllianceInfoButtonProps = {
  allianceName: string;
  clans: AllianceClanLink[];
  className?: string;
  label?: ReactNode;
  compactLabel?: ReactNode;
};

export default function AllianceInfoButton({
  allianceName,
  clans,
  className = "",
  label,
  compactLabel,
}: AllianceInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const fullLabel = label ?? `Альянс «${allianceName}»`;

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${className}`.trim()}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={compactLabel == null ? "" : styles.fullLabel}>
          {fullLabel}
        </span>
        {compactLabel != null ? (
          <span className={styles.compactLabel}>{compactLabel}</span>
        ) : null}
      </button>

      {open ? (
        <div className={styles.layer} role="presentation">
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setOpen(false)}
            aria-label="Закрыть информацию об альянсе"
          />

          <section
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>

            <p className={styles.eyebrow}>Альянс «{allianceName}»</p>
            <h2 id={titleId}>В одном альянсе с:</h2>

            {clans.length ? (
              <div className={styles.clans}>
                {clans.map((clan) => (
                  <Link
                    href={`/clans/${clan.clanId}`}
                    className={styles.clanLink}
                    key={clan.clanId}
                    onClick={() => setOpen(false)}
                  >
                    {clan.crestSmall ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={clan.crestSmall} alt="" width={19} height={19} />
                    ) : (
                      <span className={styles.crestFallback} aria-hidden="true">
                        {clan.icon || "🛡"}
                      </span>
                    )}
                    <span>{clan.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Других кланов в альянсе пока нет.</p>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
