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
            Кто пришёл, кто ушёл, кто апнулся, женился и обзавёлся новым
            смайликом :)
          </p>
        </header>

        <ChronicleClient />
      </section>
    </main>
  );
}
