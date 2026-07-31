import players from "../../../data/players.json";
import smiles from "../../../data/personal-smiles.json";
import items from "../../../data/personal-items.json";
import CouplesClient from "./CouplesClient";

type Player = { cuid:string; nick:string; level?:number; clanId?:string; clanName?:string; clanIcon?:string; profileUrl?:string; marriagePartner?:string; marriageSince?:string };
type Smile = { nick:string; personalSmilesCount?:number };
type Item = { owner:string };
export default function Page(){
 const smileCounts=Object.fromEntries((smiles as Smile[]).map(x=>[x.nick.toLocaleLowerCase("ru"),x.personalSmilesCount||0]));
 const itemCounts:Record<string,number>={}; for(const x of (items as {items:Item[]}).items) itemCounts[x.owner.toLocaleLowerCase("ru")]=(itemCounts[x.owner.toLocaleLowerCase("ru")]||0)+1;
 return <CouplesClient players={players as Player[]} smileCounts={smileCounts} itemCounts={itemCounts}/>;
}
