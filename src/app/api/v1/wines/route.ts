import { NextRequest } from 'next/server';
import { withApiAuth, withScope } from '@/lib/api-middleware';
import { CommonErrors, createSuccessResponse, ValidationErrorBuilder } from '@/lib/api-errors';
import { ApiScope } from '@/lib/api-service';
import {
  ApiWineListQuerySchema,
  CreateApiWineInputSchema,
} from '@/server/schemas/api-wines';
import { createApiWine, listApiWines } from '@/server/services/api-wines';

// GET /api/v1/wines - Get all wines for the authenticated user
export async function GET(request: NextRequest) {
  return withApiAuth(request, withScope(ApiScope.WINES_READ)(async (req, ctx) => {
    try {
      const { searchParams } = new URL(req.url);
      const parsedQuery = ApiWineListQuerySchema.safeParse({
        page: searchParams.get('page') ?? undefined,
        limit: searchParams.get('limit') ?? undefined,
        search: searchParams.get('search') ?? undefined,
      });

      if (!parsedQuery.success) {
        const validator = new ValidationErrorBuilder();

        for (const issue of parsedQuery.error.issues) {
          const field = issue.path[0]?.toString() || 'query';
          validator.addError(field, issue.message);
        }

        return validator.build();
      }

      const wineList = await listApiWines(ctx.userId, parsedQuery.data);

      if (!wineList) {
        return CommonErrors.userNotFound();
      }
      
      return createSuccessResponse(
        wineList.wines,
        200,
        {
          pagination: wineList.pagination,
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId
        }
      );
    } catch (error) {
      console.error('Error fetching wines:', error);
      return CommonErrors.internalServerError({
        message: 'Nastala chyba při načítání vín',
        requestId: ctx.requestId
      });
    }
  }));
}

// POST /api/v1/wines - Create a new wine
export async function POST(request: NextRequest) {
  return withApiAuth(request, withScope(ApiScope.WINES_WRITE)(async (req, ctx) => {
    try {
      const body = await req.json();
      const parsedBody = CreateApiWineInputSchema.safeParse(body);

      if (!parsedBody.success) {
        const validator = new ValidationErrorBuilder();

        for (const issue of parsedBody.error.issues) {
          const field = issue.path[0]?.toString() || 'body';
          validator.addError(field, issue.message);
        }

        return validator.build();
      }

      const wine = await createApiWine(ctx.userId, parsedBody.data);

      if (!wine) {
        return CommonErrors.userNotFound();
      }
      
      return createSuccessResponse(
        wine,
        201,
        {
          timestamp: new Date().toISOString(),
          requestId: ctx.requestId
        }
      );
    } catch (error) {
      console.error('Error creating wine:', error);
      return CommonErrors.internalServerError({
        message: 'Nastala chyba při vytváření vína',
        requestId: ctx.requestId
      });
    }
  }));
}
