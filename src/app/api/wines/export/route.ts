import { NextRequest, NextResponse } from 'next/server';
import { obfuscateData } from '@/lib/encryption';
import { requireSessionUser } from '@/server/http/require-session-user';
import { exportOwnedWines } from '@/server/services/api-wines';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const exportResult = await exportOwnedWines(session.user.id);

    if (!exportResult) {
      return NextResponse.json(
        { message: 'Účet nebyl nalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: obfuscateData(exportResult.payload),
      exportDate: exportResult.exportDate,
      totalWines: exportResult.totalWines,
      message: 'Export úspěšně vytvořen',
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { message: 'Export dat selhal' },
      { status: 500 }
    );
  }
}
