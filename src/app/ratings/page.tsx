import ratingsData from "../../../data/ratings.json";
import RatingsClient from "./RatingsClient";

export default function RatingsPage() {
  return <RatingsClient data={ratingsData} />;
}
