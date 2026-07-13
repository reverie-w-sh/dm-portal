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
        color: "#d97706",
        label: "Заходил от 2 до 7 дней назад",
      };
    }

    if (inactiveMinutes < THIRTY_DAYS_MINUTES) {
      return {
        color: "#8c929b",
        label: "Заходил от 7 до 30 дней назад",
      };
    }

    return {
      color: "#4d525a",
      label: "Заходил больше месяца назад",
    };
  }

  return {
    color: "#4d525a",
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

export function ActivityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-muted">
      Вход: 
      <LegendItem color="#39a96b">
        < 48 часов
      </LegendItem>

      <LegendItem color="#d97706">
        2–7 дней
      </LegendItem>

      <LegendItem color="#8c929b">
        7–30 дней
      </LegendItem>

      <LegendItem color="#4d525a">
        больше месяца
      </LegendItem>
    </div>
  );
}
