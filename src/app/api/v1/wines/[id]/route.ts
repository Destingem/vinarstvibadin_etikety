import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, withScope } from '@/lib/api-middleware';
import { ApiScope } from '@/lib/api-service';
import { ValidationErrorBuilder } from '@/lib/api-errors';
import { UpdateApiWineInputSchema } from '@/server/schemas/api-wines';
import {
  deleteOwnedApiWine,
  getOwnedApiWine,
  updateOwnedApiWine,
} from '@/server/services/api-wines';

// GET /api/v1/wines/[id] - Get a specific wine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, withScope(ApiScope.WINES_READ)(async (_req, ctx) => {
    try {
      const { id: wineId } = await params;

      const result = await getOwnedApiWine(ctx.userId, wineId);

      if (result.status === 'forbidden') {
        return NextResponse.json(
          { error: 'Přístup odepřen', message: 'Nemáte oprávnění přistupovat k tomuto vínu' },
          { status: 403 }
        );
      }

      if (result.status === 'not_found') {
        return NextResponse.json(
          { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.wine);
    } catch (error) {
      console.error('Error fetching wine:', error);

      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při načítání vína' },
        { status: 500 }
      );
    }
  }));
}

// PUT /api/v1/wines/[id] - Update a specific wine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, withScope(ApiScope.WINES_WRITE)(async (req, ctx) => {
    try {
      const { id: wineId } = await params;
      const body = await req.json();
      const parsedBody = UpdateApiWineInputSchema.safeParse(body);

      if (!parsedBody.success) {
        const validator = new ValidationErrorBuilder();

        for (const issue of parsedBody.error.issues) {
          const field = issue.path[0]?.toString() || 'body';
          validator.addError(field, issue.message);
        }

        return validator.build();
      }

      const result = await updateOwnedApiWine(ctx.userId, wineId, parsedBody.data);

      if (result.status === 'forbidden') {
        return NextResponse.json(
          { error: 'Přístup odepřen', message: 'Nemáte oprávnění upravovat toto víno' },
          { status: 403 }
        );
      }

      if (result.status === 'not_found') {
        return NextResponse.json(
          { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        message: 'Víno bylo úspěšně aktualizováno',
        wine: result.wine
      });
    } catch (error) {
      console.error('Error updating wine:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při aktualizaci vína' },
        { status: 500 }
      );
    }
  }));
}

// DELETE /api/v1/wines/[id] - Delete a specific wine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, withScope(ApiScope.WINES_DELETE)(async (_req, ctx) => {
    try {
      const { id: wineId } = await params;

      const result = await deleteOwnedApiWine(ctx.userId, wineId);

      if (result.status === 'forbidden') {
        return NextResponse.json(
          { error: 'Přístup odepřen', message: 'Nemáte oprávnění smazat toto víno' },
          { status: 403 }
        );
      }

      if (result.status === 'not_found') {
        return NextResponse.json(
          { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        message: 'Víno bylo úspěšně smazáno'
      });
    } catch (error) {
      console.error('Error deleting wine:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při mazání vína' },
        { status: 500 }
      );
    }
  }));
}
