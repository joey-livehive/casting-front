import { PartnerMatchingPageClient } from './PartnerMatchingPageClient';

type PageProps = {
  params: Promise<{ reportUid: string }>;
};

export default async function PartnerCastPage({ params }: PageProps) {
  const { reportUid } = await params;
  return <PartnerMatchingPageClient uid={reportUid} />;
}
