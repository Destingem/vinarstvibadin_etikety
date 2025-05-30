import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { getAllMemberships, createMembership, getMembershipByUserId, updateMembership } from '@/lib/appwrite';

const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

const MEMBERSHIP_PLANS = {
  STANDARD: { wineLimit: 20, price: 690 },
  PLUS: { wineLimit: 50, price: 1490 },
  NEOMEZENĚ: { wineLimit: -1, price: 6990 }, // -1 means unlimited
  ENTERPRISE: { wineLimit: -1, price: 0 } // Custom pricing
};

async function isAdmin(email: string): Promise<boolean> {
  return ADMIN_EMAILS.includes(email);
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { memberships, total } = await getAllMemberships(limit, offset);

    // Get user details from Appwrite for each membership
    const membershipsWithUsers = await Promise.all(
      memberships.map(async (membership) => {
        try {
          const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${membership.appwriteUserId}`, {
            headers: {
              'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
              'X-Appwrite-Key': process.env.APPWRITE_KEY || ''
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            return {
              ...membership,
              user: {
                email: userData.email,
                name: userData.prefs?.displayName || userData.name || 'Unknown'
              }
            };
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        
        return {
          ...membership,
          user: { email: 'Unknown', name: 'Unknown' }
        };
      })
    );

    return NextResponse.json({
      memberships: membershipsWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { appwriteUserId, plan } = await request.json();

    if (!appwriteUserId || !plan || !MEMBERSHIP_PLANS[plan as keyof typeof MEMBERSHIP_PLANS]) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const planConfig = MEMBERSHIP_PLANS[plan as keyof typeof MEMBERSHIP_PLANS];
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now

    // Check if membership already exists
    const existingMembership = await getMembershipByUserId(appwriteUserId);

    let membership;
    if (existingMembership) {
      // Update existing membership
      membership = await updateMembership(existingMembership.$id!, {
        plan: plan as any,
        wineLimit: planConfig.wineLimit,
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        resetYear: new Date().getFullYear()
      });
    } else {
      // Create new membership
      membership = await createMembership({
        appwriteUserId,
        plan: plan as any,
        wineLimit: planConfig.wineLimit,
        currentWineCount: 0,
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        resetYear: new Date().getFullYear()
      });
    }

    return NextResponse.json(membership);
  } catch (error) {
    console.error('Error creating/updating membership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}