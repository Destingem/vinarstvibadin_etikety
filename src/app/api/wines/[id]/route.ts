import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUser } from '@/server/http/require-session-user';
import { UpdateApiWineInputSchema } from '@/server/schemas/api-wines';
import {
  deleteOwnedApiWine,
  getOwnedApiWine,
  updateOwnedApiWine,
} from '@/server/services/api-wines';

function createOwnershipErrorResponse(status: 'forbidden' | 'not_found') {
  if (status === 'forbidden') {
    return NextResponse.json(
      { message: 'Nemáte oprávnění k přístupu k tomuto vínu' },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { message: 'Víno nebylo nalezeno' },
    { status: 404 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const { id } = await params;
    const result = await getOwnedApiWine(session.user.id, id);

    if (result.status !== 'ok') {
      return createOwnershipErrorResponse(result.status);
    }

    return NextResponse.json({ wine: result.wine });
  } catch (error) {
    console.error('Error fetching wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při načítání vína' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const { id } = await params;
    const body = await request.json();
    const parsedInput = UpdateApiWineInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: parsedInput.error.format() },
        { status: 400 }
      );
    }

    const result = await updateOwnedApiWine(session.user.id, id, parsedInput.data);

    if (result.status !== 'ok') {
      return createOwnershipErrorResponse(result.status);
    }

    return NextResponse.json({
      message: 'Víno bylo úspěšně aktualizováno',
      wine: result.wine,
    });
  } catch (error) {
    console.error('Error updating wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při aktualizaci vína' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const { id } = await params;
    const result = await deleteOwnedApiWine(session.user.id, id);

    if (result.status !== 'ok') {
      return createOwnershipErrorResponse(result.status);
    }

    return NextResponse.json({
      message: 'Víno bylo úspěšně smazáno',
    });
  } catch (error) {
    console.error('Error deleting wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při mazání vína' },
      { status: 500 }
    );
  }
}
