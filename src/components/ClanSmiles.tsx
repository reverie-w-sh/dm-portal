"use client";

import { useEffect, useState } from "react";

type ClanSmile = {
  src: string;
  code: string;
};

type ClanSmilesProps = {
  clanId: number | string;
};

export default function ClanSmiles({ clanId }: ClanSmilesProps) {
  const [smiles, setSmiles] = useState<ClanSmile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSmiles() {
      setLoading(true);

      try {
        const response = await fetch(`/api/clan-smiles/${clanId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить смайлики");
        }

        const data = await response.json();

        setSmiles(Array.isArray(data.smiles) ? data.smiles : []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error);
          setSmiles([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadSmiles();

    return () => controller.abort();
  }, [clanId]);

  if (loading) {
    return (
      <div className="py-3 text-sm text-ink-muted">
        Загружаем смайлики...
      </div>
    );
  }

  if (smiles.length === 0) {
    return (
      <div className="py-3 text-sm text-ink-muted">
        Клановые смайлики не найдены
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {smiles.map((smile, index) => (
        <div
          key={`${smile.src}-${index}`}
          title={smile.code || "Клановый смайлик"}
          className="flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={smile.src}
            alt={smile.code || "Клановый смайлик"}
            className="max-h-[70px] max-w-[100px] object-contain"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
