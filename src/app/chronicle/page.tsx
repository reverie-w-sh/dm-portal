import ChronicleClient from "./ChronicleClient";
import styles from "./page.module.css";

export default function ChroniclePage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.ornament} aria-hidden="true">
            <span />
            <b>🐾</b>
            <span />
          </div>

          <h1>Летопись Древнего Мира</h1>
          <p>
            Здесь остаётся след всего важного: новые уровни, перемены в кланах,
            свадьбы и новые смайлики.
          </p>
        </header>

        <ChronicleClient />
      </section>
    </main>
  );
}
