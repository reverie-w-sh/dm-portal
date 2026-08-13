import Link from "next/link";

type ActivityStatusProps = {
  inactiveMinutes?: number | null;
  className?: string;
};

type ActivityCategory = {
  color: string;
  label: string;
};

const TWO_DAYS_MINUTES = 2 * 24 * 60;
const SEVEN_DAYS_MINUTES = 7 * 24 * 60;
const THIRTY_DAYS_MINUTES = 30 * 24 * 60;

function getActivityCategory(
  inactiveMinutes?: number | null
): ActivityCategory {
  if (
    inactiveMinutes !== null &&
    inactiveMinutes !== undefined
  ) {
    if (inactiveMinutes < TWO_DAYS_MINUTES) {
      return {
        color: "#39a96b",
        label: "Заходил менее 48 часов назад",
      };
    }

    if (inactiveMinutes < SEVEN_DAYS_MINUTES) {
      return {
        color: "#c8ad6d",
        label: "Заходил от 2 до 7 дней назад",
      };
    }

    if (inactiveMinutes < THIRTY_DAYS_MINUTES) {
      return {
        color: "#b98272",
        label: "Заходил от 7 до 30 дней назад",
      };
    }

    return {
      color: "#777b82",
      label: "Заходил больше месяца назад",
    };
  }

  return {
    color: "#777b82",
    label: "Нет данных о последнем входе",
  };
}

export function ActivityDot({
  inactiveMinutes,
  className = "w-3 h-3",
}: ActivityStatusProps) {
  const category =
    getActivityCategory(inactiveMinutes);

  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-label={category.label}
      role="img"
    >
      <title>{category.label}</title>

      <circle
        cx="6"
        cy="6"
        r="4.1"
        stroke={category.color}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function LegendItem({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <svg
        viewBox="0 0 12 12"
        fill="none"
        className="w-3 h-3 shrink-0"
        aria-hidden="true"
      >
        <circle
          cx="6"
          cy="6"
          r="4.1"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>

      <span>{children}</span>
    </span>
  );
}

export function ActivityLegend({
  showExperienceLink = false,
}: {
  showExperienceLink?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-[11px] text-ink-muted">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>Вход:</span>

        <LegendItem color="#39a96b">менее 48 часов назад</LegendItem>
        <LegendItem color="#c8ad6d">2–7 дней</LegendItem>
        <LegendItem color="#b98272">7–30 дней</LegendItem>
        <LegendItem color="#777b82">больше месяца</LegendItem>
      </div>

      {showExperienceLink ? (
        <p>
          Ап персонажа можно посмотреть в{" "}
          <Link
            href="/ratings"
            className="text-accent underline underline-offset-2 hover:opacity-75 transition-opacity"
          >
            рейтингах
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
