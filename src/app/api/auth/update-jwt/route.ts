import { BACKEND_URL } from '@/core/lib/web/constants';
import {
  createSession,
  deleteSession,
  updateTokens,
} from '@/core/lib/web/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { refresh } = await req.json();

    // Call backend to refresh tokens
    const backendRes = await fetch(BACKEND_URL + '/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });


    if (!backendRes.ok) {
      // Clear the session cookie in the response
      await deleteSession();

      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 },
      );
    }

    const { data } = await backendRes.json();
    const { accessToken, refreshToken } = data;


    // Create new session with updated tokens
    await updateTokens({ accessToken, refreshToken });


    // Return new tokens
    // revalidatePath(allRoutes.auth.children.signIn.path, 'layout');
    // revalidatePath(allRoutes.auth.children.signIn.path, 'page');
    return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
  } catch (error) {
    console.error('Token refresh failed:', error);
    await deleteSession();
    // revalidatePath(allRoutes.auth.children.signIn.path, 'layout');
    // revalidatePath(allRoutes.auth.children.signIn.path, 'page');

    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 },
    );
  }
}
