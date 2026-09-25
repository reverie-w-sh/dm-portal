"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { patches, recipes } from "./data";
import { itemDifferences } from "./differences";
import styles from "./page.module.css";

type Mode = "patch" | "enchant" | null;
type Resource = [string, number];
const normalize = (name: string) => name.replace(/\s*\(Мд\)/g, "(Мд)").toLowerCase();
const differences = new Map(itemDifferences.map(item => [normalize(item.name), item]));
const patchSlots = ["Броня", "Шлем", "Сапоги", "Перчатки", "Щит"];
const patchEffects = ["Жизнь", "Броня", "Сила", "Меткость"] as const;
const runePrefixes = ["Малая руна", "Руна", "Большая руна", "Великая руна", "Древнейшая руна", "Легендарная руна"];
const runeForms = ["жизни", "брони", "силы", "меткости"];
const patchHearts: Record<number, Resource[]> = {
  1: [["Малахитовое сердце", 1], ["Мифрильное сердце", 1], ["Рецепт лабиринта", 1]],
  2: [["Малахитовое сердце", 2], ["Мифрильное сердце", 2], ["Золотое сердце", 2], ["Рецепт лабиринта", 1]],
  3: [["Малахитовое сердце", 3], ["Мифрильное сердце", 3], ["Золотое сердце", 2], ["Кровавое сердце", 1], ["Рецепт лабиринта", 1]],
  4: [["Шкура зайца", 40], ["Шкура волка", 20], ["Шкура кабана", 20], ["Шкура медведя", 10]],
  5: [["Шкура зайца", 150], ["Шкура волка", 80], ["Шкура кабана", 70], ["Шкура медведя", 50]],
  6: [["Шкура зайца", 180], ["Шкура волка", 95], ["Шкура кабана", 90], ["Шкура медведя", 60]],
};
const patchRequirement: Record<number, string> = {3:"Вещь от 10-го уровня",4:"Вещь от 12-го уровня",5:"Вещь от 14-го уровня",6:"Вещь 16-го уровня"};
function ResourceList({items}: {items: Resource[]}) {
  return <ul className={styles.resourceList}>{items.map(([name,count]) => <li key={name}><span>{name}</span><strong>×{count.toLocaleString("ru-RU")}</strong></li>)}</ul>;
}
export default function CraftPlanner() {
  const [mode,setMode] = useState<Mode>(null);
  const [slot,setSlot] = useState("");
  const [patchLevel,setPatchLevel] = useState("");
  const [effect,setEffect] = useState("");
  const [itemName,setItemName] = useState("");
  const [enchantLevel,setEnchantLevel] = useState("");
  const [enchantSlot,setEnchantSlot] = useState("");
  const [enchantName,setEnchantName] = useState("");
  useEffect(() => {
    if (window.location.hash === "#casting") setMode("enchant");
    if (window.location.hash === "#leather") setMode("patch");
  }, []);
  const levels = [...new Set(recipes.map(recipe => recipe.level))];
  const slots = [...new Set(recipes.filter(recipe => recipe.level === Number(enchantLevel)).map(recipe => recipe.slot))];
  const recipe = recipes.find(r => r.level === Number(enchantLevel) && r.slot === enchantSlot);
  const item = enchantName ? differences.get(normalize(enchantName)) : undefined;
  const availableEffects = slot === "Щит" ? ["Жизнь"] : slot === "Броня" || slot === "Шлем" ? ["Жизнь", "Броня"] : slot === "Сапоги" ? ["Жизнь", "Броня", "Сила"] : [...patchEffects];
  const patch = patches.find(p => p.level === Number(patchLevel));
  const effectIndex = patchEffects.indexOf(effect as typeof patchEffects[number]);
  const amount = patch && effect ? patch.stats[slot === "Щит" ? 4 : effectIndex] : null;
  const resources = useMemo<Resource[]>(() => {
    if (!patch || !effect || effectIndex < 0) return [];
    return [[`${runePrefixes[patch.level-1]} ${runeForms[effectIndex]}`,1], ...patchHearts[patch.level]];
  }, [patch,effect,effectIndex]);
  return <section className={styles.planner} aria-labelledby="planner-title">
    <p className={styles.kicker}>Что хочешь сделать?</p><h2 id="planner-title">Подбери рецепт для своей вещи</h2>
    <div className={styles.modeGrid}>
      <button type="button" className={`${styles.modeCard} ${mode === "enchant" ? styles.active : ""}`} onClick={() => setMode("enchant")} aria-pressed={mode === "enchant"} id="casting"><span className={styles.modeIcon}>✦</span><strong>Зачаровать вещь</strong><span>Выбери предмет и увидишь, чем ЗЧ отличается от обычного</span></button>
      <button type="button" className={`${styles.modeCard} ${mode === "patch" ? styles.active : ""}`} onClick={() => setMode("patch")} aria-pressed={mode === "patch"} id="leather"><span className={styles.modeIcon}>◆</span><strong>Поставить заплатку</strong><span>Выбери часть экипировки, уровень и прибавку</span></button>
    </div>
    {mode === "enchant" && <div className={styles.workArea}>
      <div className={styles.fields}>
        <label>1. Уровень ЗЧ<select value={enchantLevel} onChange={e => {setEnchantLevel(e.target.value);setEnchantSlot("");setEnchantName("")}}><option value="">Выбери уровень</option>{levels.map(level => <option key={level} value={level}>{level}-й уровень</option>)}</select></label>
        <label>2. Тип вещи<select value={enchantSlot} disabled={!enchantLevel} onChange={e => {setEnchantSlot(e.target.value);setEnchantName("")}}><option value="">Выбери тип</option>{slots.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>3. Твоя вещь<select value={enchantName} disabled={!recipe} onChange={e => setEnchantName(e.target.value)}><option value="">Выбери предмет</option>{recipe?.names.map(name => <option key={name} value={name}>{name}</option>)}</select></label>
      </div>
      {item && recipe ? <div className={styles.result} aria-live="polite"><p className={styles.resultLabel}>После зачарования получится</p><h3>{enchantName} (Зч)</h3><p className={styles.muted}>По сравнению с обычной вещью изменятся:</p><ul className={styles.changeList}>{item.diff.map(([stat, before, after]) => <li key={stat}><span>{stat}</span><span>{before} → <b>{after}</b> <em>{after-before>0?"+":""}{after-before}</em></span></li>)}</ul>{item.req.length > 0 && <p className={styles.requirement}>Требования: {item.req.map(([stat,before,after]) => `${stat} ${before} → ${after}`).join(", ")}</p>}<h4>Подготовь для одной попытки</h4><ResourceList items={[[`Обычная вещь: ${enchantName}`,1],...recipe.resources]}/><p className={styles.itemLinks}><a href={item.base} target="_blank" rel="noreferrer">Обычная вещь ↗</a> · <a href={item.ench} target="_blank" rel="noreferrer">ЗЧ в игре ↗</a> · <Link href="/world/alchemist">К Алхимику на карте →</Link></p></div> : <p className={styles.placeholder}>Выбери предмет, и здесь появятся его изменения и список ресурсов.</p>}
    </div>}
    {mode === "patch" && <div className={styles.workArea}>
      <div className={styles.fields}>
        <label>1. На что ставим?<select value={slot} onChange={e => {setSlot(e.target.value);setEffect("")}}><option value="">Выбери вещь</option>{patchSlots.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>2. Уровень заплатки<select value={patchLevel} disabled={!slot} onChange={e => setPatchLevel(e.target.value)}><option value="">Выбери уровень</option>{patches.map(p => <option key={p.level} value={p.level}>{p.level}-й уровень</option>)}</select></label>
        <label>3. Что прибавить?<select value={effect} disabled={!slot || !patchLevel} onChange={e => setEffect(e.target.value)}><option value="">Выбери прибавку</option>{availableEffects.map(value => <option key={value}>{value}</option>)}</select></label>
      </div>
      {amount != null && patch ? <div className={styles.result} aria-live="polite"><p className={styles.resultLabel}>После удачной установки</p><h3>{itemName.trim() || slot}: +{amount} {effect.toLowerCase()}</h3><label className={styles.optionalName}>Название своей вещи (необязательно)<input value={itemName} onChange={e => setItemName(e.target.value)} placeholder={`Например: ${slot.toLowerCase()} моего сета`}/></label>{patchRequirement[patch.level] && <p className={styles.requirement}>{patchRequirement[patch.level]}</p>}<h4>Подготовь для одной попытки</h4><ResourceList items={resources}/><p className={styles.muted}>При неудаче ресурсы расходуются. Результат показан как прибавка к твоей вещи.</p><p className={styles.itemLinks}><Link href="/world/workshop">К Мастерской на карте →</Link></p></div> : <p className={styles.placeholder}>Выбери вещь, уровень и прибавку, чтобы увидеть результат и ресурсы.</p>}
    </div>}
  </section>;
}
