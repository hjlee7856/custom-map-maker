import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminUser } from "@/lib/auth";
import { getAdminPlaces, getCategories, getPublicPlaces } from "@/lib/place-repository";

export default async function AdminPage() {
  const user = await requireAdminUser();
  const [places, categories, publishedPlaces] = await Promise.all([
    getAdminPlaces(),
    getCategories(),
    getPublicPlaces(),
  ]);

  return (
    <AdminDashboard
      places={places}
      categories={categories}
      previewPlaces={publishedPlaces}
      userEmail={user.email}
    />
  );
}
