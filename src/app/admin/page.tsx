import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminUser } from "@/lib/auth";
import { getPlaces } from "@/lib/place-repository";

export default async function AdminPage() {
  const user = await requireAdminUser();
  const places = await getPlaces();

  return <AdminDashboard places={places} userEmail={user.email} />;
}
