import {
  adminDatabases,
  DB_ID,
  ID,
  Query,
  WINES_COLLECTION_ID,
} from '@/lib/appwrite-client';
import {
  AppwriteWineRecordSchema,
  type AppwriteWineRecord,
  AppwriteWineWriteDataSchema,
  type AppwriteWineWriteData,
} from '@/server/schemas/wine';

const DEFAULT_WINE_LIST_LIMIT = 1000;

type ListWineSourceOptions = {
  limit?: number;
  offset?: number;
  search?: string;
};

type WineIdentity = {
  name: string;
  vintage?: number;
  batch?: string;
};

function parseWineDocument(document: unknown) {
  const parsedDocument = AppwriteWineRecordSchema.safeParse(document);

  if (!parsedDocument.success) {
    console.error(
      '[server.repositories.wines] Invalid wine document payload',
      parsedDocument.error.flatten()
    );
    return null;
  }

  return parsedDocument.data;
}

async function queryWineDocuments(
  ownerUserId: string,
  options: Required<ListWineSourceOptions>,
  sorted: boolean
) {
  const queries = [Query.equal('userId', ownerUserId), Query.limit(options.limit)];

  if (options.offset > 0) {
    queries.push(Query.offset(options.offset));
  }

  if (options.search) {
    queries.push(Query.search('name', options.search));
  }

  if (sorted) {
    queries.push(Query.orderDesc('createdAt'));
  }

  return adminDatabases.listDocuments(DB_ID, WINES_COLLECTION_ID, queries);
}

export async function listWineSourcesByOwnerUserId(
  ownerUserId: string,
  options: ListWineSourceOptions = {}
): Promise<{ documents: AppwriteWineRecord[]; total: number }> {
  const normalizedOptions: Required<ListWineSourceOptions> = {
    limit: options.limit ?? DEFAULT_WINE_LIST_LIMIT,
    offset: options.offset ?? 0,
    search: options.search?.trim() ?? '',
  };

  let response;

  try {
    response = await queryWineDocuments(ownerUserId, normalizedOptions, true);
  } catch (error) {
    console.warn(
      '[server.repositories.wines] Falling back to unsorted wine query',
      error
    );
    response = await queryWineDocuments(ownerUserId, normalizedOptions, false);
  }

  const documents = response.documents.flatMap((document) => {
    const parsedDocument = parseWineDocument(document);
    return parsedDocument ? [parsedDocument] : [];
  });

  return {
    documents,
    total: response.total,
  };
}

export async function findWineSourceById(
  wineId: string
): Promise<AppwriteWineRecord | null> {
  try {
    const document = await adminDatabases.getDocument(DB_ID, WINES_COLLECTION_ID, wineId);
    return parseWineDocument(document);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 404
    ) {
      return null;
    }

    throw error;
  }
}

export async function createWineSource(
  input: AppwriteWineWriteData
): Promise<AppwriteWineRecord> {
  const documentData = AppwriteWineWriteDataSchema.parse(input);
  const createdDocument = await adminDatabases.createDocument(
    DB_ID,
    WINES_COLLECTION_ID,
    ID.unique(),
    documentData
  );

  const parsedDocument = parseWineDocument(createdDocument);

  if (!parsedDocument) {
    throw new Error('Invalid wine document returned after create');
  }

  return parsedDocument;
}

export async function updateWineSource(
  wineId: string,
  input: AppwriteWineWriteData
): Promise<AppwriteWineRecord> {
  const documentData = AppwriteWineWriteDataSchema.parse(input);
  const updatedDocument = await adminDatabases.updateDocument(
    DB_ID,
    WINES_COLLECTION_ID,
    wineId,
    documentData
  );

  const parsedDocument = parseWineDocument(updatedDocument);

  if (!parsedDocument) {
    throw new Error('Invalid wine document returned after update');
  }

  return parsedDocument;
}

export async function deleteWineSource(wineId: string): Promise<void> {
  await adminDatabases.deleteDocument(DB_ID, WINES_COLLECTION_ID, wineId);
}

export async function getOwnedWineSourceById(
  ownerUserId: string,
  wineId: string
): Promise<{ status: 'not_found' | 'forbidden' | 'ok'; wine?: AppwriteWineRecord }> {
  const wine = await findWineSourceById(wineId);

  if (!wine) {
    return { status: 'not_found' };
  }

  if (wine.userId !== ownerUserId) {
    return { status: 'forbidden' };
  }

  return {
    status: 'ok',
    wine,
  };
}

export async function findExistingWineSourceByIdentity(
  ownerUserId: string,
  identity: WineIdentity
): Promise<AppwriteWineRecord | null> {
  const queries = [
    Query.equal('userId', ownerUserId),
    Query.equal('name', identity.name),
    Query.limit(1),
  ];

  if (identity.vintage !== undefined) {
    queries.push(Query.equal('vintage', identity.vintage));
  }

  if (identity.batch) {
    queries.push(Query.equal('batch', identity.batch));
  }

  const response = await adminDatabases.listDocuments(
    DB_ID,
    WINES_COLLECTION_ID,
    queries
  );

  const existingWine = response.documents[0];

  if (!existingWine) {
    return null;
  }

  return parseWineDocument(existingWine);
}
