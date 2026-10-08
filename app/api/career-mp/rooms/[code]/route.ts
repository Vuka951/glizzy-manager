import { handleGet } from '@/lib/server/career-mp/handlers';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  return handleGet(req, code);
}
