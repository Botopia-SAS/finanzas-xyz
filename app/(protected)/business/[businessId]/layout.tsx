import BusinessLayout from "@/components/BusinessLayout";

interface BusinessLayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}

export default async function Layout({ 
  children, 
  params 
}: BusinessLayoutProps) {
  const { businessId } = await params;

  return (
    <BusinessLayout businessId={businessId}>
      {children}
    </BusinessLayout>
  );
}