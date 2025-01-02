import { BACKEND_URL } from '@/constants/constants';
import { createSession, deleteSession } from '@/lib/session';
import { getSession } from '@/lib/session';
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
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 },
      );
    }

    const { data } = await backendRes.json();
    const { accessToken, refreshToken, userId, name } = data;

    // Get current session
    const currentSession = await getSession();

    // Create new session with updated tokens
    await createSession({
      user: {
        id: userId || currentSession?.user.id,
        name: name || currentSession?.user.name,
      },
      accessToken,
      refreshToken,
    });

    // Return new tokens
    return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
  } catch (error) {
    console.error('Token refresh failed:', error);
    await deleteSession();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
