import Link from "next/link";
import { patches, recipes } from "./data";
import { itemDifferences } from "./differences";
import styles from "./page.module.css";
import CraftPlanner from "./CraftPlanner";
const normalize = (name: string) => name.replace(/\s*\(Мд\)/g, "(Мд)").toLowerCase();
const byName = new Map(itemDifferences.map(item => [normalize(item.name), item]));
export default function CraftingGuide(){return <main className={styles.page}><div className={styles.shell}>
<Link href="/links">← Библиотека</Link><h1>Кожевничество и заклинательство</h1><p className={styles.intro}>Выбери заплатку или зачарование. Здесь сразу увидишь, что изменится и какие ресурсы понадобятся.</p><CraftPlanner/><details className={styles.reference}><summary>Списки необходимого количества ресурсов, сравнение характеристик всех вещей</summary>
<section id="leather-reference"><h2>Кожевничество</h2><p>Заплатки на жизнь и броню подходят для брони, шлема, сапог и перчаток. Силу добавляют на сапоги и перчатки, меткость — на перчатки. Для щита предусмотрена отдельная прибавка жизни. В каждом рецепте нужна одна руна соответствующего свойства.</p><div className={styles.scroll}><table><thead><tr><th>Уровень</th><th>Жизнь</th><th>Броня</th><th>Сила</th><th>Меткость</th><th>Щит: жизнь</th><th>Ресурсы на одну заплатку</th></tr></thead><tbody>{patches.map(p=><tr key={p.level}><th>{p.level}<br/><small>{p.rune}</small></th>{p.stats.map((v,i)=><td key={i}>+{v}</td>)}<td>{p.cost}<br/><small>{p.note}</small></td></tr>)}</tbody></table></div><p>Удача даёт +3 навыка, неудача +1; при шансе 80% навык не растёт. Снять заплатку можно в кузнице (обычно 5% цены вещи, минимум 5 меди). Вещь с заплаткой нельзя передать или продать.</p></section>
<section id="special"><h2>Особые заплатки <small className={styles.status}>(есть в библиотеке, на данный момент в игре не реализовано или отключено)</small></h2><div className={styles.grid}><article><h3>Рубаха: МК и АМК</h3><p>4-й уровень: +15%, шкуры зайца/волка/кабана/медведя 2000/1700/1500/1100 и 1 БРМК или БРАМК. Вещь от 14 уровня.</p><p>5-й: +20%, шкуры 3000/2700/2500/2100 и 1 ВРМК или ВРАМК.</p><p>6-й: +25%, шкуры 6000/5500/5000/4100 и 1 ДРМК или ДРАМК.</p><p>7-й: +30%, шкуры 10700/7500/7000/6000 и 1 ЛРМК или ЛРАМК. Вещь 16 уровня.</p></article><article><h3>Поглощение</h3><p>Сапоги получают поглощение, кольца монстров — антипоглощение. На одну заплатку нужны части соответствующей руны и материалы из списка ниже. Для антипоглощения дополнительно нужен светлый осмий.</p>
<ul>
  <li><b>5-й уровень, +4%:</b> олово 5, цинк 20, магний 5, иридий 15, свинец 5; 65 ЧРП для сапог или 5 ЧРАП и 15 светлого осмия для кольца.</li>
  <li><b>6-й уровень, +6%:</b> стронций 25, ртуть 20, палладий 30, индий 30, радий 15; 80 ЧРП для сапог или 7 ЧРАП и 30 светлого осмия для кольца.</li>
  <li><b>7-й уровень, +8%:</b> свинец 12, фосфор 20, стронций 20, ртуть 15, палладий 25; 95 ЧРП для сапог или 9 ЧРАП и 25 светлого осмия для кольца. Сапоги от 16-го, кольцо от 18-го уровня.</li>
  <li><b>8-й уровень, +10%:</b> стронций 25, ртуть 20, палладий 30, индий 30, радий 15; 120 ЧРП для сапог или 12 ЧРАП и 30 светлого осмия для кольца. Вещь от 20-го уровня.</li>
</ul></article><article><h3>Уникальные руны, 7-й</h3><p>Шкуры: 300 зайца, 220 волка, 200 кабана, 180 медведя и одна подходящая уникальная руна. Вещь от 8 уровня.</p><p>Шлем: +4 магии хаоса, смерти, жизни или порядка. Сапоги: +4 проникания или сопротивления магии. Броня: +10 скорости или +8 характеристик. Перчатки: +8 парирования. Щит: +7 блока. Руны даёт квест «Древнейшие письмена».</p></article></div></section>
<section id="casting-reference"><h2>Заклинательство</h2><p>На каждый рецепт нужна одна обычная вещь из списка и весь указанный набор. Внутри одной группы ресурсы одинаковы для любого названного предмета. При неудаче обычная вещь остаётся, а ресурсы исчезают. Навык: +5 за удачу и +1 за неудачу. Зачарованную вещь нельзя починить в кузнице. Когда её долговечность исчерпается, вещь не исчезнет: зачарование слетит, а обычная вещь снова будет как новая. Если захочешь вернуть ЗЧ, её придётся зачаровать заново.</p><div className={styles.recipes}>{recipes.map((r,i)=><article key={i}><h3>{r.level}-й уровень · {r.slot}</h3><div className={styles.items}>{r.names.map(name => {
  const item = byName.get(normalize(name));
  return <div key={name} className={styles.item}>
    <h4>{name} → ЗЧ</h4>
    {item && <><ul className={styles.differences}>{item.diff.map(([stat, before, after]) => <li key={stat}>{stat}: {before} → {after} <b>({after > before ? "+" : ""}{after - before})</b></li>)}</ul>
      {item.req.length > 0 && <p className={styles.requirement}>Требования: {item.req.map(([stat, before, after]) => `${stat} ${before} → ${after}`).join(", ")}</p>}
      <p className={styles.itemLinks}><a href={item.base} target="_blank" rel="noreferrer">Обычная вещь</a> · <a href={item.ench} target="_blank" rel="noreferrer">ЗЧ в игровой библиотеке</a></p></>}
  </div>;
})}</div><div className={styles.chips}>{r.resources.map(([name,n])=><span key={name}>{name} <b>×{n}</b></span>)}<span>Обычная вещь <b>×1</b></span></div></article>)}</div><p>Разница характеристик рассчитана по карточкам обычных и зачарованных вещей в игровой библиотеке. Если рецепт изменится, перед зачарованием проверь его у заклинателя.</p></section></details>
</div></main>}
