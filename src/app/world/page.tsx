import Image from "next/image";
import WorldNavigator from "./WorldNavigator";
import styles from "./page.module.css";

type WorldPageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function WorldPage({ searchParams }: WorldPageProps) {
  const { from, to } = await searchParams;
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.titleRow}>
            <span aria-hidden="true" />
            <h1>Карта мира</h1>
            <span aria-hidden="true" />
          </div>
          <div className={styles.ornament} aria-hidden="true">
            <span />
            <Image src="/icons/wolf-paw-gold.png" alt="" width={22} height={22} />
            <span />
          </div>
          <p>
            Выбери, где стоишь и куда хочешь попасть. Навигатор покажет путь
            по тем названиям и кнопкам, которые ты увидишь в игре.
          </p>
        </header>
        <WorldNavigator initialFrom={from} initialTo={to} />
      </div>
    </main>
  );
}
