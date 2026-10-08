import { handleAction } from '@/lib/server/career-mp/handlers';

export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  return handleAction(req, code);
}
