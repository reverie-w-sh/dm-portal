export default function DimBoliPage() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-10">

      <h1 className="text-3xl font-black text-ink tracking-tight mb-2 text-center">
        Карты Дома Боли (Кровавого Подземелья)
      </h1>

      <div className="divider-accent mb-10" />

      <div className="kp-grid">

        {[1,2,3,4,5,6].map((id)=>(
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
