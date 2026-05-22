import { InviteAcquisitionPage } from '@/app/casting/_components/InviteAcquisitionPage';

type PageProps = {
  params: Promise<{ inviteToken: string }>;
};

export default async function CasterInvitePage({ params }: PageProps) {
  const { inviteToken } = await params;
  return <InviteAcquisitionPage channel="caster" inviteToken={inviteToken} />;
}
