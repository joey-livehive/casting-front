import { Suspense } from 'react';
import { InviteAcquisitionPage } from '@/app/casting/_components/InviteAcquisitionPage';

type PageProps = {
  params: Promise<{ inviteToken: string }>;
};

export default async function InstagramInvitePage({ params }: PageProps) {
  const { inviteToken } = await params;
  return (
    <Suspense fallback={null}>
      <InviteAcquisitionPage channel="instagram" inviteToken={inviteToken} />
    </Suspense>
  );
}
