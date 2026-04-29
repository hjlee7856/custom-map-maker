import { MapExplorer } from "@/components/map-explorer";
import { getCategories, getPublicPlaces } from "@/lib/place-repository";

export default async function Home() {
  const [places, categories] = await Promise.all([
    getPublicPlaces(),
    getCategories(),
  ]);

  return <MapExplorer places={places} categories={categories} />;
}
