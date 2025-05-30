import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { getMembershipByUserId, checkWineLimit } from '@/lib/appwrite';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get user's membership
    const membership = await getMembershipByUserId(userId);
    
    if (!membership) {
      return NextResponse.json({
        hasMembership: false,
        message: 'Nemáte aktivní členství. Kontaktujte administrátora.',
        canCreateWines: false,
        currentCount: 0,
        limit: 0
      });
    }
    
    // Check if membership is active and not expired
    const now = new Date();
    const expiresAt = new Date(membership.expiresAt);
    const isExpired = expiresAt < now;
    const isActive = membership.isActive && !isExpired;
    
    if (!isActive) {
      return NextResponse.json({
        hasMembership: true,
        membership: {
          plan: membership.plan,
          expiresAt: membership.expiresAt,
          isActive: false,
          isExpired
        },
        message: isExpired ? 'Vaše členství vypršelo.' : 'Vaše členství není aktivní.',
        canCreateWines: false,
        currentCount: membership.currentWineCount,
        limit: membership.wineLimit
      });
    }
    
    // Check wine limits
    const limitCheck = await checkWineLimit(userId);
    
    const remainingWines = limitCheck.limit === -1 ? -1 : limitCheck.limit - limitCheck.currentCount;
    const yearInfo = limitCheck.yearlyLimit > 0 
      ? ` (${limitCheck.yearlyLimit} vín ročně × ${limitCheck.yearsSinceStart} ${limitCheck.yearsSinceStart === 1 ? 'rok' : limitCheck.yearsSinceStart < 5 ? 'roky' : 'let'})`
      : '';
    
    return NextResponse.json({
      hasMembership: true,
      membership: {
        plan: membership.plan,
        wineLimit: membership.wineLimit,
        currentWineCount: membership.currentWineCount,
        expiresAt: membership.expiresAt,
        isActive: true,
        isExpired: false,
        resetYear: membership.resetYear
      },
      canCreateWines: limitCheck.canCreate,
      currentCount: limitCheck.currentCount,
      limit: limitCheck.limit,
      yearlyLimit: limitCheck.yearlyLimit,
      yearsSinceStart: limitCheck.yearsSinceStart,
      message: limitCheck.canCreate 
        ? remainingWines === -1 
          ? 'Můžete vytvořit neomezený počet vín.'
          : `Můžete vytvořit ještě ${remainingWines} vín${yearInfo}.`
        : `Dosáhli jste kumulativního limitu ${limitCheck.limit} vín${yearInfo}.`
    });
    
  } catch (error) {
    console.error('Error checking membership status:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při kontrole členství' },
      { status: 500 }
    );
  }
}