import { BACKEND_URL } from '@/constants/constants';
import { fetchAuth } from '@/lib/fetch-auth';
import { deleteSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = await fetchAuth({
    url: BACKEND_URL + '/auth/signout',
    method: 'POST',
  });
  console.log('Signout Response', res);

  if (res.success) {
    await deleteSession();
  }

  revalidatePath('/', 'layout');
  revalidatePath('/', 'page');
  return NextResponse.redirect(new URL('/', req.nextUrl));
}
