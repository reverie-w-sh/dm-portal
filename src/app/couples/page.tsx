import players from "../../../data/players.json";
import smiles from "../../../data/personal-smiles.json";
import items from "../../../data/personal-items.json";
import CouplesClient from "./CouplesClient";

type Player = { cuid:string; nick:string; level?:number; clanId?:string; clanName?:string; clanIcon?:string; profileUrl?:string; marriagePartner?:string; marriageSince?:string };
type Smile = { nick:string; personalSmilesCount?:number };
type Item = { owner:string; name:string; imageUrl:string };
export default function Page(){
 const smileCounts=Object.fromEntries((smiles as Smile[]).map(x=>[x.nick.toLocaleLowerCase("ru"),x.personalSmilesCount||0]));
 const uniqueItems:Record<string,Set<string>>={};
 for(const x of (items as {items:Item[]}).items){
  const owner=x.owner.toLocaleLowerCase("ru");
  (uniqueItems[owner]??=new Set()).add(`${x.name.trim().toLocaleLowerCase("ru")}\u0000${x.imageUrl}`);
 }
 const itemCounts=Object.fromEntries(Object.entries(uniqueItems).map(([owner,set])=>[owner,set.size]));
 return <CouplesClient players={players as Player[]} smileCounts={smileCounts} itemCounts={itemCounts}/>;
}
