import { OwnerConnectionPageClient } from './OwnerConnectionPageClient';

type PageProps = {
  params: Promise<{ uid: string }>;
};

export default async function OwnerCastingPage({ params }: PageProps) {
  const { uid } = await params;
  return <OwnerConnectionPageClient uid={uid} />;
}
