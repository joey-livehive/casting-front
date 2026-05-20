import { OwnerMatchingPageClient } from './OwnerMatchingPageClient';

type PageProps = {
  params: Promise<{ reportUid: string }>;
};

export default async function OwnerCastingPage({ params }: PageProps) {
  const { reportUid } = await params;
  return <OwnerMatchingPageClient uid={reportUid} />;
}
