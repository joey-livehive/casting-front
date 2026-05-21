import { AutoMatchingPageClient } from './AutoMatchingPageClient';

type PageProps = {
  params: Promise<{ reportUid: string }>;
};

export default async function CastingReportPage({ params }: PageProps) {
  const { reportUid } = await params;
  return <AutoMatchingPageClient uid={reportUid} />;
}
