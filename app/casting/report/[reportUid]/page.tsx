import { PartnerMatchingPageClient } from './cast/PartnerMatchingPageClient';
import { OwnerMatchingPageClient } from './casting/OwnerMatchingPageClient';

type PageProps = {
  params: Promise<{ reportUid: string }>;
};

export default async function MatchingReportPage({ params }: PageProps) {
  const { reportUid } = await params;
  if (reportUid.startsWith('CASTING-P-')) {
    return <PartnerMatchingPageClient uid={reportUid} canonical />;
  }
  return <OwnerMatchingPageClient uid={reportUid} canonical />;
}
