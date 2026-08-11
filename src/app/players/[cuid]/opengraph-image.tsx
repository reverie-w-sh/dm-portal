import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import playersJson from "../../../../data/players.json";
import ratingsJson from "../../../../data/ratings.json";
import { getExperienceProgress } from "@/lib/experience";

type Player = {
  cuid: string;
  nick: string;
  level: number;
  levelUp?: number;
  clanName?: string;
  reincarnationLevel?: number | null;
  characterImage?: string;
};

const players = playersJson as Player[];
const playerRatings = (ratingsJson as {
  ratings?: { players?: { items?: Array<{ name: string; experience?: number; exp?: number }> } };
}).ratings?.players?.items ?? [];

const PLAYER_PREVIEW_IMAGES: Record<string, string> = {
  "2171": "/images/players/previews/2171.png",
  "3358": "/images/players/previews/3358.png",
  "4394": "/images/players/previews/4394.png",
};

const LOCAL_CHARACTER_IMAGES: Record<string, string> = {
  "2171": "/images/players/characters/2171.gif",
  "3358": "/images/players/characters/3358v6-0.gif",
  "4394": "/images/players/characters/4394.gif",
};

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Карточка игрока Древнего Мира";

async function pngDataUri(bytes: Buffer): Promise<string> {
  const png = await sharp(bytes, { animated: false }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function localImage(path: string): Promise<string> {
  const bytes = await readFile(join(process.cwd(), "public", path.replace(/^\/+/, "")));
  return pngDataUri(bytes);
}

async function imageSource(path?: string): Promise<string> {
  if (path?.startsWith("/images/players/")) {
    try {
      return await localImage(path);
    } catch {
      // Если файл ещё не попал в репозиторий, покажем нейтральный знак клана.
    }
  }

  // Внешний сервер игры здесь намеренно не запрашиваем: превью работает
  // только с образом, который уже сохранил отдельный workflow.
  return localImage("/icons/wolf-paw-gold.png");
}

function portraitPath(player?: Player): string | undefined {
  if (!player) return undefined;
  if (PLAYER_PREVIEW_IMAGES[player.cuid]) return PLAYER_PREVIEW_IMAGES[player.cuid];
  if (player.characterImage?.startsWith("/")) return player.characterImage;
  return LOCAL_CHARACTER_IMAGES[player.cuid] ?? player.characterImage;
}

function levelText(player: Player): string {
  const normalizedNick = player.nick.trim().toLocaleLowerCase("ru-RU");
  const rating = playerRatings.find(
    (item) => item.name.trim().toLocaleLowerCase("ru-RU") === normalizedNick,
  );
  const experience = rating?.experience ?? rating?.exp;
  const progress = typeof experience === "number" && Number.isFinite(experience)
    ? getExperienceProgress(experience)
    : undefined;
  const currentUp = progress?.level === player.level ? progress.up : player.levelUp;
  const up = currentUp != null ? `, ${currentUp} ап` : "";
  return `Уровень ${player.level}${up}`;
}

export default async function PlayerOpenGraphImage({
  params,
}: {
  params: Promise<{ cuid: string }>;
}) {
  const { cuid } = await params;
  const player = players.find((item) => item.cuid === cuid);
  const background = await localImage("/images/about/dark-marble-seamless.webp");
  const serifFont = await readFile(join(process.cwd(), "public/fonts/player-card-serif.otf"));
  const responseOptions = {
    ...size,
    fonts: [{
      name: "Player Card Serif",
      data: serifFont,
      weight: 400 as const,
      style: "normal" as const,
    }],
  };

  if (!player) {
    const fallback = await imageSource();
    return new ImageResponse(
      <PreviewFrame background={background} portrait={fallback} nick="Игрок не найден" level="Древний Мир" clan="die Wölfchen" />,
      responseOptions,
    );
  }

  const portrait = await imageSource(portraitPath(player));
  const clan = player.clanName?.trim() || "Без клана";

  return new ImageResponse(
    <PreviewFrame
      background={background}
      portrait={portrait}
      nick={player.nick}
      level={levelText(player)}
      clan={clan}
    />,
    responseOptions,
  );
}

function PreviewFrame({
  background,
  portrait,
  nick,
  level,
  clan,
}: {
  background: string;
  portrait: string;
  nick: string;
  level: string;
  clan: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        color: "#e7c986",
        background: "#080806",
        fontFamily: "Player Card Serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={background}
        width={1200}
        height={630}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.55,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 28,
          right: 28,
          bottom: 28,
          left: 28,
          display: "flex",
          border: "2px solid #8f5d18",
          boxShadow: "inset 0 0 0 1px #241606, 0 0 28px rgba(0,0,0,.8)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 38,
          right: 38,
          bottom: 38,
          left: 38,
          display: "flex",
          border: "1px solid rgba(224,166,67,.45)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: "62px 78px",
          display: "flex",
          alignItems: "center",
          gap: 72,
          background: "radial-gradient(circle at 70% 50%, rgba(90,48,10,.18), transparent 46%)",
        }}
      >
        <div
          style={{
            width: 280,
            height: 476,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "3px solid #b67a22",
            boxShadow: "inset 0 0 0 3px #130d05, inset 0 0 0 4px #72470f, 0 18px 50px rgba(0,0,0,.8)",
            background: "linear-gradient(145deg, #15110a, #030403)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={portrait}
            width={250}
            height={440}
            style={{
              width: 250,
              height: 440,
              objectFit: "cover",
              objectPosition: "43% center",
            }}
          />
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
            height: 420,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: 24,
              color: "#b58a48",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Карточка игрока
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 700,
              color: "#efd08b",
              fontSize: nick.length > 17 ? 64 : 82,
              lineHeight: 1.03,
              textShadow: "0 3px 14px #000",
            }}
          >
            {nick}
          </div>
          <div
            style={{
              width: 540,
              height: 1,
              display: "flex",
              margin: "30px 0 25px",
              background: "linear-gradient(90deg, #b47a24, rgba(180,122,36,0))",
            }}
          />
          <div style={{ display: "flex", color: "#d8bd83", fontSize: 31, marginBottom: 15 }}>
            {level}
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#c59a50", fontSize: 27 }}>
            <span
              style={{
                width: 11,
                height: 11,
                display: "flex",
                flexShrink: 0,
                marginRight: 18,
                background: "#d39a36",
                transform: "rotate(45deg)",
              }}
            />
            {clan}
          </div>
          <div style={{ display: "flex", marginTop: 55, color: "#8d7248", fontSize: 21, letterSpacing: 1.2 }}>
            wolfchen-clan.com
          </div>
        </div>
      </div>
    </div>
  );
}
