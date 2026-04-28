import { ReportForm } from "@/components/report-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getCategories, getPublicPlaces } from "@/lib/place-repository";

export default async function ReportPage() {
  const user = await requireAuthenticatedUser();
  const [categories, previewPlaces] = await Promise.all([getCategories(), getPublicPlaces()]);

  return <ReportForm categories={categories} previewPlaces={previewPlaces} userEmail={user?.email} />;
}
