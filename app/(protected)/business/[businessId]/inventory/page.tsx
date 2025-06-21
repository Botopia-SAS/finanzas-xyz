import React from 'react'
import BusinessLayout from "@/components/BusinessLayout";
import { createClient } from "@/lib/supabase/server";
import InventoryList from "@/components/dashboard/InventoryList";
import BackButton from "@/components/BackButton";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ businessId: string; }>;
}) {
  const { businessId } = await params;
  
  const supabase = await createClient();
  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("business_id", businessId)
    .order("name");

  return (
    <BusinessLayout businessId={businessId}>
      <div className="p-6">
        <BackButton />
        <h1 className="text-2xl font-semibold mb-4">Inventario</h1>
        <InventoryList 
          items={inventoryItems || []} 
          businessId={businessId} 
        />
      </div>
    </BusinessLayout>
  );
}