import { redirect } from 'next/navigation';

export default async function LegacyLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/super-admin/captacao/leads/${id}`);
}
