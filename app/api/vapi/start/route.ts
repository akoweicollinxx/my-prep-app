// /app/api/vapi/start/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const userName = body?.user?.name;

  // You could validate user, set up agent, log session...
  return NextResponse.json({
    agentId: '60485abd-da8e-4a24-87aa-7b1c091aa8bd',
    user: { name: userName || 'Anonymous' }
  });
}
