This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Data Scripts

Scripts live in `scripts/` and run with `npx tsx`.

### 1. Import a rating scan

Populate `data/players.json` and `data/clans.json` from an exported player list.

```bash
npx tsx scripts/import-rating-scan.ts path/to/scan.txt
```

**Supported input formats (auto-detected):**

**A — CSV with header** (comma or tab delimited):
```
cuid,nick,level,clanId
7939,Артур,16,278
111,Катерина,16,278
```

**B — CSV without header** (positional, 4 columns: cuid, nick, level, clanId):
```
7939,Артур,16,278
```

**C — Grouped text** (clan header line → player lines):
```
# 278 die Wölfchen
7939 Артур 16
111 Катерина 16

# 7 Хранители
4567 PlayerName 10
```
Clan header: any line starting with `#` or `=` followed by a numeric clan ID.
Player line: `cuid nick level` (whitespace separated; cuid is the first number, level is the last).

**Merge rules:**
- Players are matched by `cuid`.
- Existing players: `nick`, `level`, `clanId`, `profileUrl`, `clanIcon` are updated. `position` is preserved.
- New players: created with `position: ""`.
- After import, all clan `members` arrays and `membersCount` are rebuilt from `players.json`.

---

### 2. Fetch live positions from dm-game.com

After importing, run this to fill in `position` for every real player from their live profile page.

```bash
npx tsx scripts/update-players-from-profiles.ts
```

Skips placeholder players (non-numeric cuids). Adds 300 ms delay between requests.

---

### Typical full update flow

```bash
# Step 1 — import new roster from scan file
npx tsx scripts/import-rating-scan.ts path/to/scan.txt

# Step 2 — pull live positions from dm-game.com
npx tsx scripts/update-players-from-profiles.ts
```

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
