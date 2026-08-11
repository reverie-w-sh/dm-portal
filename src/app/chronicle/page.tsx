import Image from "next/image";
import ChronicleClient from "./ChronicleClient";
import styles from "./page.module.css";

export default async function ChroniclePage(props: PageProps<"/chronicle">) {
  const searchParams = await props.searchParams;
  const playerParam = searchParams.player;
  const initialQuery = Array.isArray(playerParam) ? playerParam[0] : playerParam;

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.ornament} aria-hidden="true">
            <span />
            <Image
              src="/icons/wolf-paw-gold.png"
              alt=""
              width={22}
              height={22}
              className={styles.ornamentPaw}
            />
            <span />
          </div>

          <h1>Летопись Древнего Мира</h1>
          <p>
            Здесь остаётся след всего важного: новые уровни, перемены в кланах,
            свадьбы, новые смайлики и новости самого Древнего Мира.
          </p>
        </header>

        <ChronicleClient initialQuery={initialQuery ?? ""} />
      </section>
    </main>
  );
}
