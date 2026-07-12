import { postAuthReq } from '@/core/lib/api';
import { deleteSession } from '@/core/lib/web/session';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = await postAuthReq({
    url: '/auth/signout',
  });

  if (res.success) {
    await deleteSession();
  }

  revalidatePath('/', 'layout');
  revalidatePath('/', 'page');
  return NextResponse.redirect(new URL('/', req.nextUrl));
}
