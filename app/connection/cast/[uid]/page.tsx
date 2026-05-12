import { PartnerConnectionPageClient } from './PartnerConnectionPageClient';

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default async function PartnerCastPage({ params }: PageProps) {
  const { uid } = await params;
  return <PartnerConnectionPageClient uid={uid} />;
}
