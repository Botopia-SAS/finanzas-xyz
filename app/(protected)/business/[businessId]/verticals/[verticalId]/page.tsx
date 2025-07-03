import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/server";
import VerticalDetail from "@/components/dashboard/VerticalDetail";

export default async function VerticalDetailPage({
  params,
}: {
  params: Promise<{ businessId: string; verticalId: string }> // ✅ Cambiar a Promise
}) {
  // ✅ Await the params
  const {  verticalId } = await params;

  const supabase = await createClient();
  const { data: vertical } = await supabase
    .from("verticals")
    .select("*")
    .eq("id", verticalId)
    .single();

  const { data: movements } = await supabase
    .from("movements")
    .select("*")
    .eq("vertical_id", verticalId)
    .order("date", { ascending: false })
    .limit(100);

  return (
    <DashboardLayout>
      <VerticalDetail
        vertical={vertical}
        movements={movements || []}
      />
    </DashboardLayout>
  );
}