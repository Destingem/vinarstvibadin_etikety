import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { getAppwriteAdminHeaders, getAppwriteUrl } from '@/lib/appwrite-env';

// Get admin emails from environment variables (more secure)
function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    console.warn('ADMIN_EMAILS environment variable not set');
    return [];
  }
  return adminEmails.split(',').map(email => email.trim());
}

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email);
}

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }
    
    const verifiedToken = verifyJwtToken(token);
    if (!verifiedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const user = await getUserById(verifiedToken.userId);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch users from Appwrite
    let url = getAppwriteUrl(`/users?limit=${limit}&offset=${offset}`);
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      headers: getAppwriteAdminHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users from Appwrite');
    }

    const data = await response.json();
    
    // Format user data
    const users = data.users?.map((userData: any) => ({
      $id: userData.$id,
      email: userData.email,
      name: userData.prefs?.displayName || userData.name || 'Unknown',
      status: userData.status,
      registration: userData.registration,
      emailVerification: userData.emailVerification
    })) || [];

    return NextResponse.json({
      users,
      total: data.total || 0
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
