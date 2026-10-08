import { handleCreate, handleList } from '@/lib/server/career-mp/handlers';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return handleList(req);
}

export async function POST(req: Request) {
  return handleCreate(req);
}
