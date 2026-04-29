import { MapExplorer } from "@/components/map-explorer";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getPublicPlaces } from "@/lib/place-repository";

export default async function Home() {
  const [places, categories, user] = await Promise.all([
    getPublicPlaces(),
    getCategories(),
    getCurrentUser(),
  ]);

  return <MapExplorer places={places} categories={categories} userEmail={user?.email} />;
}
