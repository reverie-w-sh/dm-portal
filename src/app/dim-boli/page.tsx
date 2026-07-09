export default function DimBoliPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">

      <h1
        className="text-3xl font-black tracking-tight mb-2 text-center uppercase"
        style={{
          letterSpacing: "0.04em",
          color: "#e0b877",
          textShadow: "0 0 14px rgba(139,20,20,0.5)",
        }}
      >
        Карты Дома Боли
      </h1>

      <p className="text-center text-sm text-ink-muted mb-8 tracking-wide">
        Кровавое Подземелье
      </p>

      <div className="divider-accent mb-10" />

      <div className="kp-grid">

        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div key={id} className="kp-card">

            <img
              src={`/kp-maps/kp-map${id}.jpg`}
              alt={`Карта ${id}`}
            />

            <div className="kp-title">
              Карта {id}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
