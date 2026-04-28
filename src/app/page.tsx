import { MapExplorer } from "@/components/map-explorer";
import { getPlaces } from "@/lib/place-repository";

export default async function Home() {
  const places = await getPlaces();

  return <MapExplorer places={places} />;
}
