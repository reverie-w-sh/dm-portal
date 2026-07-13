"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import eventsData from "../../data/events.json";
import clansData from "../../data/clans.json";
import lastSync from "../../data/last-sync.json";

type EventsScope = "clans" | "personal-smiles";
type EventsPeriod = "sync" | "7days" | "30days";
type EventsVariant = "dark" | "light";

type BaseEvent = {
  id: string;
  syncId: string;
  createdAt: string;
  scope: EventsScope;
};

type PlayerJoinedClanEvent = BaseEvent & {
  scope: "clans";
  type: "player_joined_clan";
  characterId: string;
  characterName: string;
  profileUrl: string;
  clanId: string;
  clanName: string;
};

type PlayerLeftClanEvent = BaseEvent & {
  scope: "clans";
  type: "player_left_clan";
  characterId: string;
  characterName: string;
  profileUrl: string;
  clanId: string;
  clanName: string;
};

type PlayerChangedClanEvent = BaseEvent & {
  scope: "clans";
  type: "player_changed_clan";
  characterId: string;
  characterName: string;
  profileUrl: string;
  oldClanId: string;
  oldClanName: string;
  newClanId: string;
  newClanName: string;
};

type PlayerPositionChangedEvent = BaseEvent & {
  scope: "clans";
  type: "player_position_changed";
  characterId: string;
  characterName: string;
  profileUrl: string;
  clanId: string;
  clanName: string;
  oldPosition: string;
  newPosition: string;
};

type ClanSmileAddedEvent = BaseEvent & {
  scope: "clans";
  type: "clan_smile_added";
  clanId: string;
  clanName: string;
  amount: number;
  oldCount: number;
  newCount: number;
};

type PersonalSmileAddedEvent = BaseEvent & {
  scope: "personal-smiles";
  type: "personal_smile_added";
  characterId: string;
  characterName: string;
  profileUrl: string;
  amount: number;
  oldCount: number;
  newCount: number;
  addedSmiles: string[];
};

type SiteEvent =
  | PlayerJoinedClanEvent
  | PlayerLeftClanEvent
  | PlayerChangedClanEvent
  | PlayerPositionChangedEvent
  | ClanSmileAddedEvent
  | PersonalSmileAddedEvent;

type ClanData = {
  clanId: string;
  name: string;
  crestSmall?: string;
};

type EventsFeedProps = {
  scope: EventsScope;
  variant?: EventsVariant;
  onOpenPlayer?: (cuid: string) => void;
};

const PERIOD_LABELS: Record<EventsPeriod, string> = {
  sync: "С последнего обновления",
  "7days": "За 7 дней",
  "30days": "За 30 дней",
};

function getPeriodStart(
  period: EventsPeriod,
  lastSyncAt: string
): number {
  const lastSyncTime = new Date(lastSyncAt).getTime();

  if (period === "sync") {
    return lastSyncTime;
  }

  const days = period === "7days" ? 7 : 30;

  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function getEmptyMessage(period: EventsPeriod): string {
  switch (period) {
    case "sync":
      return "Всё спокойно, с момента последнего обновления ничего не произошло.";

    case "7days":
      return "Всё спокойно, за последние 7 дней ничего не произошло.";

    case "30days":
      return "Всё спокойно, за последние 30 дней ничего не произошло.";
  }
}

function getSmileWord(amount: number): string {
  const lastTwoDigits = amount % 100;
  const lastDigit = amount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "смайликов";
  }

  if (lastDigit === 1) {
    return "смайлик";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "смайлика";
  }

  return "смайликов";
}

function getNewSmileText(amount: number): string {
  if (amount === 1) {
    return "появился новый смайлик";
  }

  return `появилось ${amount} новых ${getSmileWord(amount)}`;
}

function getNewPersonalSmileText(amount: number): string {
  if (amount === 1) {
    return "появился новый личный смайлик";
  }

  return `появилось ${amount} новых личных ${getSmileWord(
    amount
  )}`;
}

function isOurClan(clanName: string): boolean {
  return clanName.trim().toLocaleLowerCase("de-DE") === "die wölfchen";
}

export default function EventsFeed({
  scope,
  variant = "dark",
  onOpenPlayer,
}: EventsFeedProps) {
  const [period, setPeriod] =
    useState<EventsPeriod>("sync");

  const events = eventsData as SiteEvent[];
  const clans = clansData as ClanData[];

  const clansById = useMemo(
    () =>
      new Map(
        clans.map((clan) => [clan.clanId, clan])
      ),
    [clans]
  );

  const scopedEvents = useMemo(
    () =>
      events
        .filter((event) => event.scope === scope)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        ),
    [events, scope]
  );

  const eventsByPeriod = useMemo(() => {
    const result: Record<EventsPeriod, SiteEvent[]> = {
      sync: [],
      "7days": [],
      "30days": [],
    };

    for (const currentPeriod of Object.keys(
      result
    ) as EventsPeriod[]) {
      const startTime = getPeriodStart(
        currentPeriod,
        lastSync.updatedAt
      );

result[currentPeriod] = scopedEvents.filter(
  (event) => {
    /*
     * Изменения должностей показываем только
     * с момента последнего обновления.
     *
     * В истории за 7 и 30 дней их не выводим,
     * чтобы они не забивали действительно
     * важные события.
     */
    if (
      currentPeriod !== "sync" &&
      event.type === "player_position_changed"
    ) {
      return false;
    }

    if (currentPeriod === "sync") {
      return event.syncId === lastSync.updatedAt;
    }

    const eventTime = new Date(
      event.createdAt
    ).getTime();

    return eventTime >= startTime;
  }
);
    }

    return result;
  }, [scopedEvents]);

  const visibleEvents = eventsByPeriod[period];

  const isDark = variant === "dark";

  const mutedTextClass = isDark
    ? "text-[#b9bec6]/75"
    : "text-ink-muted";

  const mainTextClass = isDark
    ? "text-[#dfe2e7]"
    : "text-ink";

  const eventBorderClass = isDark
    ? "border-white/10 bg-white/[0.025]"
    : "border-black/10 bg-white/35";

  function getClanCrest(clanId: string): string {
    return (
      clansById.get(clanId)?.crestSmall ||
      `https://dm-game.com/pics/clanpic/clan_${clanId}.gif`
    );
  }

  function CharacterLink({
    profileUrl,
    name,
  }: {
    profileUrl: string;
    name: string;
  }) {
    if (!profileUrl) {
      return (
        <span className="font-bold">{name}</span>
      );
    }

    return (
      <a
        href={profileUrl}
        target="_blank"
        rel="noreferrer"
        className="font-bold text-accent hover:underline"
      >
        {name}
      </a>
    );
  }

  function ClanLink({
    clanId,
    clanName,
  }: {
    clanId: string;
    clanName: string;
  }) {
    return (
      <Link
        href={`/clans/${clanId}`}
        className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getClanCrest(clanId)}
          alt=""
          width={19}
          height={19}
          className="w-[19px] h-[19px] object-contain shrink-0"
        />

        <span>{clanName}</span>
      </Link>
    );
  }

  function renderClanEvent(event: SiteEvent) {
    if (event.type === "player_joined_clan") {
      return (
        <p className={mainTextClass}>
          <span className="mr-2">🟢</span>

          <CharacterLink
            profileUrl={event.profileUrl}
            name={event.characterName}
          />

          <span> теперь в клане </span>

          <ClanLink
            clanId={event.clanId}
            clanName={event.clanName}
          />

          <span>.</span>
        </p>
      );
    }

    if (event.type === "player_left_clan") {
      return (
        <p className={mainTextClass}>
          <span className="mr-2">🔴</span>

          <CharacterLink
            profileUrl={event.profileUrl}
            name={event.characterName}
          />

          <span> больше не состоит в клане </span>

          <ClanLink
            clanId={event.clanId}
            clanName={event.clanName}
          />

          <span>.</span>
        </p>
      );
    }

    if (event.type === "player_changed_clan") {
      return (
        <div
          className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${mainTextClass}`}
        >
          <span className="mr-1">🔄</span>

          <CharacterLink
            profileUrl={event.profileUrl}
            name={event.characterName}
          />

          <span>теперь в</span>

          <ClanLink
            clanId={event.newClanId}
            clanName={event.newClanName}
          />

          <span>, раньше —</span>

          <ClanLink
            clanId={event.oldClanId}
            clanName={event.oldClanName}
          />

          <span>.</span>
        </div>
      );
    }

    if (event.type === "player_position_changed") {
      return (
        <div
          className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${mainTextClass}`}
        >
          <span className="mr-1">📝</span>

          <ClanLink
            clanId={event.clanId}
            clanName={event.clanName}
          />

          <span>У</span>

          <CharacterLink
            profileUrl={event.profileUrl}
            name={event.characterName}
          />

          {event.oldPosition && event.newPosition ? (
            <>
              <span>изменилась должность:</span>

              <span className="font-semibold">
                «{event.oldPosition}»
              </span>

              <span>→</span>

              <span className="font-semibold">
                «{event.newPosition}»
              </span>
            </>
          ) : event.newPosition ? (
            <>
              <span>появилась должность:</span>

              <span className="font-semibold">
                «{event.newPosition}»
              </span>
            </>
          ) : (
            <>
              <span>больше не указана должность</span>

              {event.oldPosition && (
                <span className="font-semibold">
                  (было: «{event.oldPosition}»)
                </span>
              )}
            </>
          )}

          <span>.</span>
        </div>
      );
    }

    if (event.type === "clan_smile_added") {
      return (
        <div
          className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${mainTextClass}`}
        >
          <span className="mr-1">😊</span>

          <span>У клана</span>

          <ClanLink
            clanId={event.clanId}
            clanName={event.clanName}
          />

          <span>
            {getNewSmileText(event.amount)}!
          </span>

          <span className="font-semibold">
            Поздравляем!
          </span>

          {!isOurClan(event.clanName) && (
            <span>
              Но не от чистого сердца :)
            </span>
          )}
        </div>
      );
    }

    return null;
  }

  function renderPersonalSmileEvent(
    event: PersonalSmileAddedEvent
  ) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className={mainTextClass}>
          <span className="mr-2">😊</span>

          <CharacterLink
            profileUrl={event.profileUrl}
            name={event.characterName}
          />

          <span>
            {" "}
            — {getNewPersonalSmileText(event.amount)}!
          </span>
        </p>

        <button
          type="button"
          onClick={() =>
            onOpenPlayer?.(event.characterId)
          }
          className={[
            "shrink-0 px-3 py-2 rounded-lg border text-xs font-bold transition-all",
            isDark
              ? "border-white/10 text-[#dfe2e7] bg-white/5 hover:bg-white/10"
              : "border-black/10 text-ink bg-white/60 hover:bg-white",
          ].join(" ")}
        >
          Посмотреть новый смайлик
        </button>
      </div>
    );
  }

  return (
    <section className="mt-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-bold uppercase tracking-wider mr-1 ${mutedTextClass}`}
          >
            События:
          </span>

          {(Object.keys(PERIOD_LABELS) as EventsPeriod[]).map(
            (periodKey) => {
              const isActive = period === periodKey;
              const count =
                eventsByPeriod[periodKey].length;

              return (
                <button
                  key={periodKey}
                  type="button"
                  onClick={() => setPeriod(periodKey)}
                  className={[
                    "text-xs px-3 py-2 rounded-lg border transition-colors",
                    isActive
                      ? "border-accent/40 text-accent bg-accent/10"
                      : isDark
                        ? "border-white/10 text-[#b9bec6] hover:text-[#e6e6e6] hover:border-white/20"
                        : "border-black/10 text-ink-muted bg-white/30 hover:text-ink hover:bg-white/60",
                  ].join(" ")}
                >
                  {PERIOD_LABELS[periodKey]} ({count})
                </button>
              );
            }
          )}
        </div>

        {visibleEvents.length === 0 ? (
          <p className={`text-xs ${mutedTextClass}`}>
            {getEmptyMessage(period)}
          </p>
        ) : (
          <div className="space-y-2">
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-xl border px-4 py-3 text-sm ${eventBorderClass}`}
              >
                {scope === "clans"
                  ? renderClanEvent(event)
                  : event.type ===
                      "personal_smile_added"
                    ? renderPersonalSmileEvent(event)
                    : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
