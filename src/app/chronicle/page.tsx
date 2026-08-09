import Image from "next/image";
import ChronicleClient from "./ChronicleClient";
import styles from "./page.module.css";

export default function ChroniclePage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.ornament} aria-hidden="true">
            <span />
            <Image
              className={styles.ornamentPaw}
              src="/icons/wolf-paw-gold.png"
              alt=""
              width={25}
              height={25}
            />
            <span />
          </div>

          <h1>Летопись Древнего Мира</h1>
          <p>
            Здесь остаётся след всего важного: новые уровни, перемены в кланах,
            свадьбы, новые смайлики и новости самого Древнего Мира.
          </p>
        </header>

        <ChronicleClient />
      </section>
    </main>
  );
}
