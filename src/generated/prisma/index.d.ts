
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Winery
 * 
 */
export type Winery = $Result.DefaultSelection<Prisma.$WineryPayload>
/**
 * Model Wine
 * 
 */
export type Wine = $Result.DefaultSelection<Prisma.$WinePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Wineries
 * const wineries = await prisma.winery.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Wineries
   * const wineries = await prisma.winery.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.winery`: Exposes CRUD operations for the **Winery** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Wineries
    * const wineries = await prisma.winery.findMany()
    * ```
    */
  get winery(): Prisma.WineryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.wine`: Exposes CRUD operations for the **Wine** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Wines
    * const wines = await prisma.wine.findMany()
    * ```
    */
  get wine(): Prisma.WineDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Winery: 'Winery',
    Wine: 'Wine'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "winery" | "wine"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Winery: {
        payload: Prisma.$WineryPayload<ExtArgs>
        fields: Prisma.WineryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WineryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WineryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>
          }
          findFirst: {
            args: Prisma.WineryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WineryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>
          }
          findMany: {
            args: Prisma.WineryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>[]
          }
          create: {
            args: Prisma.WineryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>
          }
          createMany: {
            args: Prisma.WineryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WineryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>[]
          }
          delete: {
            args: Prisma.WineryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>
          }
          update: {
            args: Prisma.WineryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>
          }
          deleteMany: {
            args: Prisma.WineryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WineryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WineryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>[]
          }
          upsert: {
            args: Prisma.WineryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WineryPayload>
          }
          aggregate: {
            args: Prisma.WineryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWinery>
          }
          groupBy: {
            args: Prisma.WineryGroupByArgs<ExtArgs>
            result: $Utils.Optional<WineryGroupByOutputType>[]
          }
          count: {
            args: Prisma.WineryCountArgs<ExtArgs>
            result: $Utils.Optional<WineryCountAggregateOutputType> | number
          }
        }
      }
      Wine: {
        payload: Prisma.$WinePayload<ExtArgs>
        fields: Prisma.WineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>
          }
          findFirst: {
            args: Prisma.WineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>
          }
          findMany: {
            args: Prisma.WineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>[]
          }
          create: {
            args: Prisma.WineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>
          }
          createMany: {
            args: Prisma.WineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>[]
          }
          delete: {
            args: Prisma.WineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>
          }
          update: {
            args: Prisma.WineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>
          }
          deleteMany: {
            args: Prisma.WineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WineUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>[]
          }
          upsert: {
            args: Prisma.WineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WinePayload>
          }
          aggregate: {
            args: Prisma.WineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWine>
          }
          groupBy: {
            args: Prisma.WineGroupByArgs<ExtArgs>
            result: $Utils.Optional<WineGroupByOutputType>[]
          }
          count: {
            args: Prisma.WineCountArgs<ExtArgs>
            result: $Utils.Optional<WineCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    winery?: WineryOmit
    wine?: WineOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type WineryCountOutputType
   */

  export type WineryCountOutputType = {
    wines: number
  }

  export type WineryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wines?: boolean | WineryCountOutputTypeCountWinesArgs
  }

  // Custom InputTypes
  /**
   * WineryCountOutputType without action
   */
  export type WineryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WineryCountOutputType
     */
    select?: WineryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WineryCountOutputType without action
   */
  export type WineryCountOutputTypeCountWinesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WineWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Winery
   */

  export type AggregateWinery = {
    _count: WineryCountAggregateOutputType | null
    _min: WineryMinAggregateOutputType | null
    _max: WineryMaxAggregateOutputType | null
  }

  export type WineryMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    email: string | null
    passwordHash: string | null
    passwordSalt: string | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WineryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    email: string | null
    passwordHash: string | null
    passwordSalt: string | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WineryCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    email: number
    passwordHash: number
    passwordSalt: number
    address: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WineryMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    email?: true
    passwordHash?: true
    passwordSalt?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WineryMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    email?: true
    passwordHash?: true
    passwordSalt?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WineryCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    email?: true
    passwordHash?: true
    passwordSalt?: true
    address?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WineryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Winery to aggregate.
     */
    where?: WineryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wineries to fetch.
     */
    orderBy?: WineryOrderByWithRelationInput | WineryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WineryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wineries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wineries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Wineries
    **/
    _count?: true | WineryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WineryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WineryMaxAggregateInputType
  }

  export type GetWineryAggregateType<T extends WineryAggregateArgs> = {
        [P in keyof T & keyof AggregateWinery]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWinery[P]>
      : GetScalarType<T[P], AggregateWinery[P]>
  }




  export type WineryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WineryWhereInput
    orderBy?: WineryOrderByWithAggregationInput | WineryOrderByWithAggregationInput[]
    by: WineryScalarFieldEnum[] | WineryScalarFieldEnum
    having?: WineryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WineryCountAggregateInputType | true
    _min?: WineryMinAggregateInputType
    _max?: WineryMaxAggregateInputType
  }

  export type WineryGroupByOutputType = {
    id: string
    name: string
    slug: string
    email: string
    passwordHash: string
    passwordSalt: string
    address: string | null
    createdAt: Date
    updatedAt: Date
    _count: WineryCountAggregateOutputType | null
    _min: WineryMinAggregateOutputType | null
    _max: WineryMaxAggregateOutputType | null
  }

  type GetWineryGroupByPayload<T extends WineryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WineryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WineryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WineryGroupByOutputType[P]>
            : GetScalarType<T[P], WineryGroupByOutputType[P]>
        }
      >
    >


  export type WinerySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    email?: boolean
    passwordHash?: boolean
    passwordSalt?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    wines?: boolean | Winery$winesArgs<ExtArgs>
    _count?: boolean | WineryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["winery"]>

  export type WinerySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    email?: boolean
    passwordHash?: boolean
    passwordSalt?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["winery"]>

  export type WinerySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    email?: boolean
    passwordHash?: boolean
    passwordSalt?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["winery"]>

  export type WinerySelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    email?: boolean
    passwordHash?: boolean
    passwordSalt?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WineryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "email" | "passwordHash" | "passwordSalt" | "address" | "createdAt" | "updatedAt", ExtArgs["result"]["winery"]>
  export type WineryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wines?: boolean | Winery$winesArgs<ExtArgs>
    _count?: boolean | WineryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WineryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type WineryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WineryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Winery"
    objects: {
      wines: Prisma.$WinePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      email: string
      passwordHash: string
      passwordSalt: string
      address: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["winery"]>
    composites: {}
  }

  type WineryGetPayload<S extends boolean | null | undefined | WineryDefaultArgs> = $Result.GetResult<Prisma.$WineryPayload, S>

  type WineryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WineryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WineryCountAggregateInputType | true
    }

  export interface WineryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Winery'], meta: { name: 'Winery' } }
    /**
     * Find zero or one Winery that matches the filter.
     * @param {WineryFindUniqueArgs} args - Arguments to find a Winery
     * @example
     * // Get one Winery
     * const winery = await prisma.winery.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WineryFindUniqueArgs>(args: SelectSubset<T, WineryFindUniqueArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Winery that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WineryFindUniqueOrThrowArgs} args - Arguments to find a Winery
     * @example
     * // Get one Winery
     * const winery = await prisma.winery.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WineryFindUniqueOrThrowArgs>(args: SelectSubset<T, WineryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Winery that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryFindFirstArgs} args - Arguments to find a Winery
     * @example
     * // Get one Winery
     * const winery = await prisma.winery.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WineryFindFirstArgs>(args?: SelectSubset<T, WineryFindFirstArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Winery that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryFindFirstOrThrowArgs} args - Arguments to find a Winery
     * @example
     * // Get one Winery
     * const winery = await prisma.winery.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WineryFindFirstOrThrowArgs>(args?: SelectSubset<T, WineryFindFirstOrThrowArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Wineries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Wineries
     * const wineries = await prisma.winery.findMany()
     * 
     * // Get first 10 Wineries
     * const wineries = await prisma.winery.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const wineryWithIdOnly = await prisma.winery.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WineryFindManyArgs>(args?: SelectSubset<T, WineryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Winery.
     * @param {WineryCreateArgs} args - Arguments to create a Winery.
     * @example
     * // Create one Winery
     * const Winery = await prisma.winery.create({
     *   data: {
     *     // ... data to create a Winery
     *   }
     * })
     * 
     */
    create<T extends WineryCreateArgs>(args: SelectSubset<T, WineryCreateArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Wineries.
     * @param {WineryCreateManyArgs} args - Arguments to create many Wineries.
     * @example
     * // Create many Wineries
     * const winery = await prisma.winery.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WineryCreateManyArgs>(args?: SelectSubset<T, WineryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Wineries and returns the data saved in the database.
     * @param {WineryCreateManyAndReturnArgs} args - Arguments to create many Wineries.
     * @example
     * // Create many Wineries
     * const winery = await prisma.winery.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Wineries and only return the `id`
     * const wineryWithIdOnly = await prisma.winery.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WineryCreateManyAndReturnArgs>(args?: SelectSubset<T, WineryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Winery.
     * @param {WineryDeleteArgs} args - Arguments to delete one Winery.
     * @example
     * // Delete one Winery
     * const Winery = await prisma.winery.delete({
     *   where: {
     *     // ... filter to delete one Winery
     *   }
     * })
     * 
     */
    delete<T extends WineryDeleteArgs>(args: SelectSubset<T, WineryDeleteArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Winery.
     * @param {WineryUpdateArgs} args - Arguments to update one Winery.
     * @example
     * // Update one Winery
     * const winery = await prisma.winery.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WineryUpdateArgs>(args: SelectSubset<T, WineryUpdateArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Wineries.
     * @param {WineryDeleteManyArgs} args - Arguments to filter Wineries to delete.
     * @example
     * // Delete a few Wineries
     * const { count } = await prisma.winery.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WineryDeleteManyArgs>(args?: SelectSubset<T, WineryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Wineries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Wineries
     * const winery = await prisma.winery.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WineryUpdateManyArgs>(args: SelectSubset<T, WineryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Wineries and returns the data updated in the database.
     * @param {WineryUpdateManyAndReturnArgs} args - Arguments to update many Wineries.
     * @example
     * // Update many Wineries
     * const winery = await prisma.winery.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Wineries and only return the `id`
     * const wineryWithIdOnly = await prisma.winery.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WineryUpdateManyAndReturnArgs>(args: SelectSubset<T, WineryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Winery.
     * @param {WineryUpsertArgs} args - Arguments to update or create a Winery.
     * @example
     * // Update or create a Winery
     * const winery = await prisma.winery.upsert({
     *   create: {
     *     // ... data to create a Winery
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Winery we want to update
     *   }
     * })
     */
    upsert<T extends WineryUpsertArgs>(args: SelectSubset<T, WineryUpsertArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Wineries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryCountArgs} args - Arguments to filter Wineries to count.
     * @example
     * // Count the number of Wineries
     * const count = await prisma.winery.count({
     *   where: {
     *     // ... the filter for the Wineries we want to count
     *   }
     * })
    **/
    count<T extends WineryCountArgs>(
      args?: Subset<T, WineryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WineryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Winery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WineryAggregateArgs>(args: Subset<T, WineryAggregateArgs>): Prisma.PrismaPromise<GetWineryAggregateType<T>>

    /**
     * Group by Winery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WineryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WineryGroupByArgs['orderBy'] }
        : { orderBy?: WineryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WineryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWineryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Winery model
   */
  readonly fields: WineryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Winery.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WineryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    wines<T extends Winery$winesArgs<ExtArgs> = {}>(args?: Subset<T, Winery$winesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Winery model
   */
  interface WineryFieldRefs {
    readonly id: FieldRef<"Winery", 'String'>
    readonly name: FieldRef<"Winery", 'String'>
    readonly slug: FieldRef<"Winery", 'String'>
    readonly email: FieldRef<"Winery", 'String'>
    readonly passwordHash: FieldRef<"Winery", 'String'>
    readonly passwordSalt: FieldRef<"Winery", 'String'>
    readonly address: FieldRef<"Winery", 'String'>
    readonly createdAt: FieldRef<"Winery", 'DateTime'>
    readonly updatedAt: FieldRef<"Winery", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Winery findUnique
   */
  export type WineryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * Filter, which Winery to fetch.
     */
    where: WineryWhereUniqueInput
  }

  /**
   * Winery findUniqueOrThrow
   */
  export type WineryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * Filter, which Winery to fetch.
     */
    where: WineryWhereUniqueInput
  }

  /**
   * Winery findFirst
   */
  export type WineryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * Filter, which Winery to fetch.
     */
    where?: WineryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wineries to fetch.
     */
    orderBy?: WineryOrderByWithRelationInput | WineryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Wineries.
     */
    cursor?: WineryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wineries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wineries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Wineries.
     */
    distinct?: WineryScalarFieldEnum | WineryScalarFieldEnum[]
  }

  /**
   * Winery findFirstOrThrow
   */
  export type WineryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * Filter, which Winery to fetch.
     */
    where?: WineryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wineries to fetch.
     */
    orderBy?: WineryOrderByWithRelationInput | WineryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Wineries.
     */
    cursor?: WineryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wineries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wineries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Wineries.
     */
    distinct?: WineryScalarFieldEnum | WineryScalarFieldEnum[]
  }

  /**
   * Winery findMany
   */
  export type WineryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * Filter, which Wineries to fetch.
     */
    where?: WineryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wineries to fetch.
     */
    orderBy?: WineryOrderByWithRelationInput | WineryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Wineries.
     */
    cursor?: WineryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wineries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wineries.
     */
    skip?: number
    distinct?: WineryScalarFieldEnum | WineryScalarFieldEnum[]
  }

  /**
   * Winery create
   */
  export type WineryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * The data needed to create a Winery.
     */
    data: XOR<WineryCreateInput, WineryUncheckedCreateInput>
  }

  /**
   * Winery createMany
   */
  export type WineryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Wineries.
     */
    data: WineryCreateManyInput | WineryCreateManyInput[]
  }

  /**
   * Winery createManyAndReturn
   */
  export type WineryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * The data used to create many Wineries.
     */
    data: WineryCreateManyInput | WineryCreateManyInput[]
  }

  /**
   * Winery update
   */
  export type WineryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * The data needed to update a Winery.
     */
    data: XOR<WineryUpdateInput, WineryUncheckedUpdateInput>
    /**
     * Choose, which Winery to update.
     */
    where: WineryWhereUniqueInput
  }

  /**
   * Winery updateMany
   */
  export type WineryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Wineries.
     */
    data: XOR<WineryUpdateManyMutationInput, WineryUncheckedUpdateManyInput>
    /**
     * Filter which Wineries to update
     */
    where?: WineryWhereInput
    /**
     * Limit how many Wineries to update.
     */
    limit?: number
  }

  /**
   * Winery updateManyAndReturn
   */
  export type WineryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * The data used to update Wineries.
     */
    data: XOR<WineryUpdateManyMutationInput, WineryUncheckedUpdateManyInput>
    /**
     * Filter which Wineries to update
     */
    where?: WineryWhereInput
    /**
     * Limit how many Wineries to update.
     */
    limit?: number
  }

  /**
   * Winery upsert
   */
  export type WineryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * The filter to search for the Winery to update in case it exists.
     */
    where: WineryWhereUniqueInput
    /**
     * In case the Winery found by the `where` argument doesn't exist, create a new Winery with this data.
     */
    create: XOR<WineryCreateInput, WineryUncheckedCreateInput>
    /**
     * In case the Winery was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WineryUpdateInput, WineryUncheckedUpdateInput>
  }

  /**
   * Winery delete
   */
  export type WineryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
    /**
     * Filter which Winery to delete.
     */
    where: WineryWhereUniqueInput
  }

  /**
   * Winery deleteMany
   */
  export type WineryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Wineries to delete
     */
    where?: WineryWhereInput
    /**
     * Limit how many Wineries to delete.
     */
    limit?: number
  }

  /**
   * Winery.wines
   */
  export type Winery$winesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    where?: WineWhereInput
    orderBy?: WineOrderByWithRelationInput | WineOrderByWithRelationInput[]
    cursor?: WineWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WineScalarFieldEnum | WineScalarFieldEnum[]
  }

  /**
   * Winery without action
   */
  export type WineryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Winery
     */
    select?: WinerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Winery
     */
    omit?: WineryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineryInclude<ExtArgs> | null
  }


  /**
   * Model Wine
   */

  export type AggregateWine = {
    _count: WineCountAggregateOutputType | null
    _avg: WineAvgAggregateOutputType | null
    _sum: WineSumAggregateOutputType | null
    _min: WineMinAggregateOutputType | null
    _max: WineMaxAggregateOutputType | null
  }

  export type WineAvgAggregateOutputType = {
    vintage: number | null
    alcoholContent: number | null
    energyValueKJ: number | null
    energyValueKcal: number | null
    fat: number | null
    saturatedFat: number | null
    carbs: number | null
    sugars: number | null
    protein: number | null
    salt: number | null
  }

  export type WineSumAggregateOutputType = {
    vintage: number | null
    alcoholContent: number | null
    energyValueKJ: number | null
    energyValueKcal: number | null
    fat: number | null
    saturatedFat: number | null
    carbs: number | null
    sugars: number | null
    protein: number | null
    salt: number | null
  }

  export type WineMinAggregateOutputType = {
    id: string | null
    name: string | null
    vintage: number | null
    batch: string | null
    alcoholContent: number | null
    energyValueKJ: number | null
    energyValueKcal: number | null
    fat: number | null
    saturatedFat: number | null
    carbs: number | null
    sugars: number | null
    protein: number | null
    salt: number | null
    ingredients: string | null
    additionalInfo: string | null
    allergens: string | null
    wineRegion: string | null
    wineSubregion: string | null
    wineVillage: string | null
    wineTract: string | null
    createdAt: Date | null
    updatedAt: Date | null
    wineryId: string | null
  }

  export type WineMaxAggregateOutputType = {
    id: string | null
    name: string | null
    vintage: number | null
    batch: string | null
    alcoholContent: number | null
    energyValueKJ: number | null
    energyValueKcal: number | null
    fat: number | null
    saturatedFat: number | null
    carbs: number | null
    sugars: number | null
    protein: number | null
    salt: number | null
    ingredients: string | null
    additionalInfo: string | null
    allergens: string | null
    wineRegion: string | null
    wineSubregion: string | null
    wineVillage: string | null
    wineTract: string | null
    createdAt: Date | null
    updatedAt: Date | null
    wineryId: string | null
  }

  export type WineCountAggregateOutputType = {
    id: number
    name: number
    vintage: number
    batch: number
    alcoholContent: number
    energyValueKJ: number
    energyValueKcal: number
    fat: number
    saturatedFat: number
    carbs: number
    sugars: number
    protein: number
    salt: number
    ingredients: number
    additionalInfo: number
    allergens: number
    wineRegion: number
    wineSubregion: number
    wineVillage: number
    wineTract: number
    createdAt: number
    updatedAt: number
    wineryId: number
    _all: number
  }


  export type WineAvgAggregateInputType = {
    vintage?: true
    alcoholContent?: true
    energyValueKJ?: true
    energyValueKcal?: true
    fat?: true
    saturatedFat?: true
    carbs?: true
    sugars?: true
    protein?: true
    salt?: true
  }

  export type WineSumAggregateInputType = {
    vintage?: true
    alcoholContent?: true
    energyValueKJ?: true
    energyValueKcal?: true
    fat?: true
    saturatedFat?: true
    carbs?: true
    sugars?: true
    protein?: true
    salt?: true
  }

  export type WineMinAggregateInputType = {
    id?: true
    name?: true
    vintage?: true
    batch?: true
    alcoholContent?: true
    energyValueKJ?: true
    energyValueKcal?: true
    fat?: true
    saturatedFat?: true
    carbs?: true
    sugars?: true
    protein?: true
    salt?: true
    ingredients?: true
    additionalInfo?: true
    allergens?: true
    wineRegion?: true
    wineSubregion?: true
    wineVillage?: true
    wineTract?: true
    createdAt?: true
    updatedAt?: true
    wineryId?: true
  }

  export type WineMaxAggregateInputType = {
    id?: true
    name?: true
    vintage?: true
    batch?: true
    alcoholContent?: true
    energyValueKJ?: true
    energyValueKcal?: true
    fat?: true
    saturatedFat?: true
    carbs?: true
    sugars?: true
    protein?: true
    salt?: true
    ingredients?: true
    additionalInfo?: true
    allergens?: true
    wineRegion?: true
    wineSubregion?: true
    wineVillage?: true
    wineTract?: true
    createdAt?: true
    updatedAt?: true
    wineryId?: true
  }

  export type WineCountAggregateInputType = {
    id?: true
    name?: true
    vintage?: true
    batch?: true
    alcoholContent?: true
    energyValueKJ?: true
    energyValueKcal?: true
    fat?: true
    saturatedFat?: true
    carbs?: true
    sugars?: true
    protein?: true
    salt?: true
    ingredients?: true
    additionalInfo?: true
    allergens?: true
    wineRegion?: true
    wineSubregion?: true
    wineVillage?: true
    wineTract?: true
    createdAt?: true
    updatedAt?: true
    wineryId?: true
    _all?: true
  }

  export type WineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Wine to aggregate.
     */
    where?: WineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wines to fetch.
     */
    orderBy?: WineOrderByWithRelationInput | WineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Wines
    **/
    _count?: true | WineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WineAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WineSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WineMaxAggregateInputType
  }

  export type GetWineAggregateType<T extends WineAggregateArgs> = {
        [P in keyof T & keyof AggregateWine]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWine[P]>
      : GetScalarType<T[P], AggregateWine[P]>
  }




  export type WineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WineWhereInput
    orderBy?: WineOrderByWithAggregationInput | WineOrderByWithAggregationInput[]
    by: WineScalarFieldEnum[] | WineScalarFieldEnum
    having?: WineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WineCountAggregateInputType | true
    _avg?: WineAvgAggregateInputType
    _sum?: WineSumAggregateInputType
    _min?: WineMinAggregateInputType
    _max?: WineMaxAggregateInputType
  }

  export type WineGroupByOutputType = {
    id: string
    name: string
    vintage: number | null
    batch: string | null
    alcoholContent: number | null
    energyValueKJ: number | null
    energyValueKcal: number | null
    fat: number | null
    saturatedFat: number | null
    carbs: number | null
    sugars: number | null
    protein: number | null
    salt: number | null
    ingredients: string | null
    additionalInfo: string | null
    allergens: string | null
    wineRegion: string | null
    wineSubregion: string | null
    wineVillage: string | null
    wineTract: string | null
    createdAt: Date
    updatedAt: Date
    wineryId: string
    _count: WineCountAggregateOutputType | null
    _avg: WineAvgAggregateOutputType | null
    _sum: WineSumAggregateOutputType | null
    _min: WineMinAggregateOutputType | null
    _max: WineMaxAggregateOutputType | null
  }

  type GetWineGroupByPayload<T extends WineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WineGroupByOutputType[P]>
            : GetScalarType<T[P], WineGroupByOutputType[P]>
        }
      >
    >


  export type WineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    vintage?: boolean
    batch?: boolean
    alcoholContent?: boolean
    energyValueKJ?: boolean
    energyValueKcal?: boolean
    fat?: boolean
    saturatedFat?: boolean
    carbs?: boolean
    sugars?: boolean
    protein?: boolean
    salt?: boolean
    ingredients?: boolean
    additionalInfo?: boolean
    allergens?: boolean
    wineRegion?: boolean
    wineSubregion?: boolean
    wineVillage?: boolean
    wineTract?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    wineryId?: boolean
    winery?: boolean | WineryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wine"]>

  export type WineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    vintage?: boolean
    batch?: boolean
    alcoholContent?: boolean
    energyValueKJ?: boolean
    energyValueKcal?: boolean
    fat?: boolean
    saturatedFat?: boolean
    carbs?: boolean
    sugars?: boolean
    protein?: boolean
    salt?: boolean
    ingredients?: boolean
    additionalInfo?: boolean
    allergens?: boolean
    wineRegion?: boolean
    wineSubregion?: boolean
    wineVillage?: boolean
    wineTract?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    wineryId?: boolean
    winery?: boolean | WineryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wine"]>

  export type WineSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    vintage?: boolean
    batch?: boolean
    alcoholContent?: boolean
    energyValueKJ?: boolean
    energyValueKcal?: boolean
    fat?: boolean
    saturatedFat?: boolean
    carbs?: boolean
    sugars?: boolean
    protein?: boolean
    salt?: boolean
    ingredients?: boolean
    additionalInfo?: boolean
    allergens?: boolean
    wineRegion?: boolean
    wineSubregion?: boolean
    wineVillage?: boolean
    wineTract?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    wineryId?: boolean
    winery?: boolean | WineryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wine"]>

  export type WineSelectScalar = {
    id?: boolean
    name?: boolean
    vintage?: boolean
    batch?: boolean
    alcoholContent?: boolean
    energyValueKJ?: boolean
    energyValueKcal?: boolean
    fat?: boolean
    saturatedFat?: boolean
    carbs?: boolean
    sugars?: boolean
    protein?: boolean
    salt?: boolean
    ingredients?: boolean
    additionalInfo?: boolean
    allergens?: boolean
    wineRegion?: boolean
    wineSubregion?: boolean
    wineVillage?: boolean
    wineTract?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    wineryId?: boolean
  }

  export type WineOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "vintage" | "batch" | "alcoholContent" | "energyValueKJ" | "energyValueKcal" | "fat" | "saturatedFat" | "carbs" | "sugars" | "protein" | "salt" | "ingredients" | "additionalInfo" | "allergens" | "wineRegion" | "wineSubregion" | "wineVillage" | "wineTract" | "createdAt" | "updatedAt" | "wineryId", ExtArgs["result"]["wine"]>
  export type WineInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    winery?: boolean | WineryDefaultArgs<ExtArgs>
  }
  export type WineIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    winery?: boolean | WineryDefaultArgs<ExtArgs>
  }
  export type WineIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    winery?: boolean | WineryDefaultArgs<ExtArgs>
  }

  export type $WinePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Wine"
    objects: {
      winery: Prisma.$WineryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      vintage: number | null
      batch: string | null
      alcoholContent: number | null
      energyValueKJ: number | null
      energyValueKcal: number | null
      fat: number | null
      saturatedFat: number | null
      carbs: number | null
      sugars: number | null
      protein: number | null
      salt: number | null
      ingredients: string | null
      additionalInfo: string | null
      allergens: string | null
      wineRegion: string | null
      wineSubregion: string | null
      wineVillage: string | null
      wineTract: string | null
      createdAt: Date
      updatedAt: Date
      wineryId: string
    }, ExtArgs["result"]["wine"]>
    composites: {}
  }

  type WineGetPayload<S extends boolean | null | undefined | WineDefaultArgs> = $Result.GetResult<Prisma.$WinePayload, S>

  type WineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WineFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WineCountAggregateInputType | true
    }

  export interface WineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Wine'], meta: { name: 'Wine' } }
    /**
     * Find zero or one Wine that matches the filter.
     * @param {WineFindUniqueArgs} args - Arguments to find a Wine
     * @example
     * // Get one Wine
     * const wine = await prisma.wine.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WineFindUniqueArgs>(args: SelectSubset<T, WineFindUniqueArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Wine that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WineFindUniqueOrThrowArgs} args - Arguments to find a Wine
     * @example
     * // Get one Wine
     * const wine = await prisma.wine.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WineFindUniqueOrThrowArgs>(args: SelectSubset<T, WineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Wine that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineFindFirstArgs} args - Arguments to find a Wine
     * @example
     * // Get one Wine
     * const wine = await prisma.wine.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WineFindFirstArgs>(args?: SelectSubset<T, WineFindFirstArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Wine that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineFindFirstOrThrowArgs} args - Arguments to find a Wine
     * @example
     * // Get one Wine
     * const wine = await prisma.wine.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WineFindFirstOrThrowArgs>(args?: SelectSubset<T, WineFindFirstOrThrowArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Wines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Wines
     * const wines = await prisma.wine.findMany()
     * 
     * // Get first 10 Wines
     * const wines = await prisma.wine.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const wineWithIdOnly = await prisma.wine.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WineFindManyArgs>(args?: SelectSubset<T, WineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Wine.
     * @param {WineCreateArgs} args - Arguments to create a Wine.
     * @example
     * // Create one Wine
     * const Wine = await prisma.wine.create({
     *   data: {
     *     // ... data to create a Wine
     *   }
     * })
     * 
     */
    create<T extends WineCreateArgs>(args: SelectSubset<T, WineCreateArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Wines.
     * @param {WineCreateManyArgs} args - Arguments to create many Wines.
     * @example
     * // Create many Wines
     * const wine = await prisma.wine.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WineCreateManyArgs>(args?: SelectSubset<T, WineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Wines and returns the data saved in the database.
     * @param {WineCreateManyAndReturnArgs} args - Arguments to create many Wines.
     * @example
     * // Create many Wines
     * const wine = await prisma.wine.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Wines and only return the `id`
     * const wineWithIdOnly = await prisma.wine.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WineCreateManyAndReturnArgs>(args?: SelectSubset<T, WineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Wine.
     * @param {WineDeleteArgs} args - Arguments to delete one Wine.
     * @example
     * // Delete one Wine
     * const Wine = await prisma.wine.delete({
     *   where: {
     *     // ... filter to delete one Wine
     *   }
     * })
     * 
     */
    delete<T extends WineDeleteArgs>(args: SelectSubset<T, WineDeleteArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Wine.
     * @param {WineUpdateArgs} args - Arguments to update one Wine.
     * @example
     * // Update one Wine
     * const wine = await prisma.wine.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WineUpdateArgs>(args: SelectSubset<T, WineUpdateArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Wines.
     * @param {WineDeleteManyArgs} args - Arguments to filter Wines to delete.
     * @example
     * // Delete a few Wines
     * const { count } = await prisma.wine.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WineDeleteManyArgs>(args?: SelectSubset<T, WineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Wines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Wines
     * const wine = await prisma.wine.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WineUpdateManyArgs>(args: SelectSubset<T, WineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Wines and returns the data updated in the database.
     * @param {WineUpdateManyAndReturnArgs} args - Arguments to update many Wines.
     * @example
     * // Update many Wines
     * const wine = await prisma.wine.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Wines and only return the `id`
     * const wineWithIdOnly = await prisma.wine.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WineUpdateManyAndReturnArgs>(args: SelectSubset<T, WineUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Wine.
     * @param {WineUpsertArgs} args - Arguments to update or create a Wine.
     * @example
     * // Update or create a Wine
     * const wine = await prisma.wine.upsert({
     *   create: {
     *     // ... data to create a Wine
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Wine we want to update
     *   }
     * })
     */
    upsert<T extends WineUpsertArgs>(args: SelectSubset<T, WineUpsertArgs<ExtArgs>>): Prisma__WineClient<$Result.GetResult<Prisma.$WinePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Wines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineCountArgs} args - Arguments to filter Wines to count.
     * @example
     * // Count the number of Wines
     * const count = await prisma.wine.count({
     *   where: {
     *     // ... the filter for the Wines we want to count
     *   }
     * })
    **/
    count<T extends WineCountArgs>(
      args?: Subset<T, WineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Wine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WineAggregateArgs>(args: Subset<T, WineAggregateArgs>): Prisma.PrismaPromise<GetWineAggregateType<T>>

    /**
     * Group by Wine.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WineGroupByArgs['orderBy'] }
        : { orderBy?: WineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Wine model
   */
  readonly fields: WineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Wine.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    winery<T extends WineryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WineryDefaultArgs<ExtArgs>>): Prisma__WineryClient<$Result.GetResult<Prisma.$WineryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Wine model
   */
  interface WineFieldRefs {
    readonly id: FieldRef<"Wine", 'String'>
    readonly name: FieldRef<"Wine", 'String'>
    readonly vintage: FieldRef<"Wine", 'Int'>
    readonly batch: FieldRef<"Wine", 'String'>
    readonly alcoholContent: FieldRef<"Wine", 'Float'>
    readonly energyValueKJ: FieldRef<"Wine", 'Float'>
    readonly energyValueKcal: FieldRef<"Wine", 'Float'>
    readonly fat: FieldRef<"Wine", 'Float'>
    readonly saturatedFat: FieldRef<"Wine", 'Float'>
    readonly carbs: FieldRef<"Wine", 'Float'>
    readonly sugars: FieldRef<"Wine", 'Float'>
    readonly protein: FieldRef<"Wine", 'Float'>
    readonly salt: FieldRef<"Wine", 'Float'>
    readonly ingredients: FieldRef<"Wine", 'String'>
    readonly additionalInfo: FieldRef<"Wine", 'String'>
    readonly allergens: FieldRef<"Wine", 'String'>
    readonly wineRegion: FieldRef<"Wine", 'String'>
    readonly wineSubregion: FieldRef<"Wine", 'String'>
    readonly wineVillage: FieldRef<"Wine", 'String'>
    readonly wineTract: FieldRef<"Wine", 'String'>
    readonly createdAt: FieldRef<"Wine", 'DateTime'>
    readonly updatedAt: FieldRef<"Wine", 'DateTime'>
    readonly wineryId: FieldRef<"Wine", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Wine findUnique
   */
  export type WineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * Filter, which Wine to fetch.
     */
    where: WineWhereUniqueInput
  }

  /**
   * Wine findUniqueOrThrow
   */
  export type WineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * Filter, which Wine to fetch.
     */
    where: WineWhereUniqueInput
  }

  /**
   * Wine findFirst
   */
  export type WineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * Filter, which Wine to fetch.
     */
    where?: WineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wines to fetch.
     */
    orderBy?: WineOrderByWithRelationInput | WineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Wines.
     */
    cursor?: WineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Wines.
     */
    distinct?: WineScalarFieldEnum | WineScalarFieldEnum[]
  }

  /**
   * Wine findFirstOrThrow
   */
  export type WineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * Filter, which Wine to fetch.
     */
    where?: WineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wines to fetch.
     */
    orderBy?: WineOrderByWithRelationInput | WineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Wines.
     */
    cursor?: WineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Wines.
     */
    distinct?: WineScalarFieldEnum | WineScalarFieldEnum[]
  }

  /**
   * Wine findMany
   */
  export type WineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * Filter, which Wines to fetch.
     */
    where?: WineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wines to fetch.
     */
    orderBy?: WineOrderByWithRelationInput | WineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Wines.
     */
    cursor?: WineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wines.
     */
    skip?: number
    distinct?: WineScalarFieldEnum | WineScalarFieldEnum[]
  }

  /**
   * Wine create
   */
  export type WineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * The data needed to create a Wine.
     */
    data: XOR<WineCreateInput, WineUncheckedCreateInput>
  }

  /**
   * Wine createMany
   */
  export type WineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Wines.
     */
    data: WineCreateManyInput | WineCreateManyInput[]
  }

  /**
   * Wine createManyAndReturn
   */
  export type WineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * The data used to create many Wines.
     */
    data: WineCreateManyInput | WineCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Wine update
   */
  export type WineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * The data needed to update a Wine.
     */
    data: XOR<WineUpdateInput, WineUncheckedUpdateInput>
    /**
     * Choose, which Wine to update.
     */
    where: WineWhereUniqueInput
  }

  /**
   * Wine updateMany
   */
  export type WineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Wines.
     */
    data: XOR<WineUpdateManyMutationInput, WineUncheckedUpdateManyInput>
    /**
     * Filter which Wines to update
     */
    where?: WineWhereInput
    /**
     * Limit how many Wines to update.
     */
    limit?: number
  }

  /**
   * Wine updateManyAndReturn
   */
  export type WineUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * The data used to update Wines.
     */
    data: XOR<WineUpdateManyMutationInput, WineUncheckedUpdateManyInput>
    /**
     * Filter which Wines to update
     */
    where?: WineWhereInput
    /**
     * Limit how many Wines to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Wine upsert
   */
  export type WineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * The filter to search for the Wine to update in case it exists.
     */
    where: WineWhereUniqueInput
    /**
     * In case the Wine found by the `where` argument doesn't exist, create a new Wine with this data.
     */
    create: XOR<WineCreateInput, WineUncheckedCreateInput>
    /**
     * In case the Wine was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WineUpdateInput, WineUncheckedUpdateInput>
  }

  /**
   * Wine delete
   */
  export type WineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
    /**
     * Filter which Wine to delete.
     */
    where: WineWhereUniqueInput
  }

  /**
   * Wine deleteMany
   */
  export type WineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Wines to delete
     */
    where?: WineWhereInput
    /**
     * Limit how many Wines to delete.
     */
    limit?: number
  }

  /**
   * Wine without action
   */
  export type WineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wine
     */
    select?: WineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wine
     */
    omit?: WineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WineInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WineryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    email: 'email',
    passwordHash: 'passwordHash',
    passwordSalt: 'passwordSalt',
    address: 'address',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WineryScalarFieldEnum = (typeof WineryScalarFieldEnum)[keyof typeof WineryScalarFieldEnum]


  export const WineScalarFieldEnum: {
    id: 'id',
    name: 'name',
    vintage: 'vintage',
    batch: 'batch',
    alcoholContent: 'alcoholContent',
    energyValueKJ: 'energyValueKJ',
    energyValueKcal: 'energyValueKcal',
    fat: 'fat',
    saturatedFat: 'saturatedFat',
    carbs: 'carbs',
    sugars: 'sugars',
    protein: 'protein',
    salt: 'salt',
    ingredients: 'ingredients',
    additionalInfo: 'additionalInfo',
    allergens: 'allergens',
    wineRegion: 'wineRegion',
    wineSubregion: 'wineSubregion',
    wineVillage: 'wineVillage',
    wineTract: 'wineTract',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    wineryId: 'wineryId'
  };

  export type WineScalarFieldEnum = (typeof WineScalarFieldEnum)[keyof typeof WineScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type WineryWhereInput = {
    AND?: WineryWhereInput | WineryWhereInput[]
    OR?: WineryWhereInput[]
    NOT?: WineryWhereInput | WineryWhereInput[]
    id?: StringFilter<"Winery"> | string
    name?: StringFilter<"Winery"> | string
    slug?: StringFilter<"Winery"> | string
    email?: StringFilter<"Winery"> | string
    passwordHash?: StringFilter<"Winery"> | string
    passwordSalt?: StringFilter<"Winery"> | string
    address?: StringNullableFilter<"Winery"> | string | null
    createdAt?: DateTimeFilter<"Winery"> | Date | string
    updatedAt?: DateTimeFilter<"Winery"> | Date | string
    wines?: WineListRelationFilter
  }

  export type WineryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    passwordSalt?: SortOrder
    address?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wines?: WineOrderByRelationAggregateInput
  }

  export type WineryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    slug?: string
    email?: string
    AND?: WineryWhereInput | WineryWhereInput[]
    OR?: WineryWhereInput[]
    NOT?: WineryWhereInput | WineryWhereInput[]
    passwordHash?: StringFilter<"Winery"> | string
    passwordSalt?: StringFilter<"Winery"> | string
    address?: StringNullableFilter<"Winery"> | string | null
    createdAt?: DateTimeFilter<"Winery"> | Date | string
    updatedAt?: DateTimeFilter<"Winery"> | Date | string
    wines?: WineListRelationFilter
  }, "id" | "name" | "slug" | "email">

  export type WineryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    passwordSalt?: SortOrder
    address?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WineryCountOrderByAggregateInput
    _max?: WineryMaxOrderByAggregateInput
    _min?: WineryMinOrderByAggregateInput
  }

  export type WineryScalarWhereWithAggregatesInput = {
    AND?: WineryScalarWhereWithAggregatesInput | WineryScalarWhereWithAggregatesInput[]
    OR?: WineryScalarWhereWithAggregatesInput[]
    NOT?: WineryScalarWhereWithAggregatesInput | WineryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Winery"> | string
    name?: StringWithAggregatesFilter<"Winery"> | string
    slug?: StringWithAggregatesFilter<"Winery"> | string
    email?: StringWithAggregatesFilter<"Winery"> | string
    passwordHash?: StringWithAggregatesFilter<"Winery"> | string
    passwordSalt?: StringWithAggregatesFilter<"Winery"> | string
    address?: StringNullableWithAggregatesFilter<"Winery"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Winery"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Winery"> | Date | string
  }

  export type WineWhereInput = {
    AND?: WineWhereInput | WineWhereInput[]
    OR?: WineWhereInput[]
    NOT?: WineWhereInput | WineWhereInput[]
    id?: StringFilter<"Wine"> | string
    name?: StringFilter<"Wine"> | string
    vintage?: IntNullableFilter<"Wine"> | number | null
    batch?: StringNullableFilter<"Wine"> | string | null
    alcoholContent?: FloatNullableFilter<"Wine"> | number | null
    energyValueKJ?: FloatNullableFilter<"Wine"> | number | null
    energyValueKcal?: FloatNullableFilter<"Wine"> | number | null
    fat?: FloatNullableFilter<"Wine"> | number | null
    saturatedFat?: FloatNullableFilter<"Wine"> | number | null
    carbs?: FloatNullableFilter<"Wine"> | number | null
    sugars?: FloatNullableFilter<"Wine"> | number | null
    protein?: FloatNullableFilter<"Wine"> | number | null
    salt?: FloatNullableFilter<"Wine"> | number | null
    ingredients?: StringNullableFilter<"Wine"> | string | null
    additionalInfo?: StringNullableFilter<"Wine"> | string | null
    allergens?: StringNullableFilter<"Wine"> | string | null
    wineRegion?: StringNullableFilter<"Wine"> | string | null
    wineSubregion?: StringNullableFilter<"Wine"> | string | null
    wineVillage?: StringNullableFilter<"Wine"> | string | null
    wineTract?: StringNullableFilter<"Wine"> | string | null
    createdAt?: DateTimeFilter<"Wine"> | Date | string
    updatedAt?: DateTimeFilter<"Wine"> | Date | string
    wineryId?: StringFilter<"Wine"> | string
    winery?: XOR<WineryScalarRelationFilter, WineryWhereInput>
  }

  export type WineOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    vintage?: SortOrderInput | SortOrder
    batch?: SortOrderInput | SortOrder
    alcoholContent?: SortOrderInput | SortOrder
    energyValueKJ?: SortOrderInput | SortOrder
    energyValueKcal?: SortOrderInput | SortOrder
    fat?: SortOrderInput | SortOrder
    saturatedFat?: SortOrderInput | SortOrder
    carbs?: SortOrderInput | SortOrder
    sugars?: SortOrderInput | SortOrder
    protein?: SortOrderInput | SortOrder
    salt?: SortOrderInput | SortOrder
    ingredients?: SortOrderInput | SortOrder
    additionalInfo?: SortOrderInput | SortOrder
    allergens?: SortOrderInput | SortOrder
    wineRegion?: SortOrderInput | SortOrder
    wineSubregion?: SortOrderInput | SortOrder
    wineVillage?: SortOrderInput | SortOrder
    wineTract?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wineryId?: SortOrder
    winery?: WineryOrderByWithRelationInput
  }

  export type WineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    wineryId_name_vintage_batch?: WineWineryIdNameVintageBatchCompoundUniqueInput
    AND?: WineWhereInput | WineWhereInput[]
    OR?: WineWhereInput[]
    NOT?: WineWhereInput | WineWhereInput[]
    name?: StringFilter<"Wine"> | string
    vintage?: IntNullableFilter<"Wine"> | number | null
    batch?: StringNullableFilter<"Wine"> | string | null
    alcoholContent?: FloatNullableFilter<"Wine"> | number | null
    energyValueKJ?: FloatNullableFilter<"Wine"> | number | null
    energyValueKcal?: FloatNullableFilter<"Wine"> | number | null
    fat?: FloatNullableFilter<"Wine"> | number | null
    saturatedFat?: FloatNullableFilter<"Wine"> | number | null
    carbs?: FloatNullableFilter<"Wine"> | number | null
    sugars?: FloatNullableFilter<"Wine"> | number | null
    protein?: FloatNullableFilter<"Wine"> | number | null
    salt?: FloatNullableFilter<"Wine"> | number | null
    ingredients?: StringNullableFilter<"Wine"> | string | null
    additionalInfo?: StringNullableFilter<"Wine"> | string | null
    allergens?: StringNullableFilter<"Wine"> | string | null
    wineRegion?: StringNullableFilter<"Wine"> | string | null
    wineSubregion?: StringNullableFilter<"Wine"> | string | null
    wineVillage?: StringNullableFilter<"Wine"> | string | null
    wineTract?: StringNullableFilter<"Wine"> | string | null
    createdAt?: DateTimeFilter<"Wine"> | Date | string
    updatedAt?: DateTimeFilter<"Wine"> | Date | string
    wineryId?: StringFilter<"Wine"> | string
    winery?: XOR<WineryScalarRelationFilter, WineryWhereInput>
  }, "id" | "wineryId_name_vintage_batch">

  export type WineOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    vintage?: SortOrderInput | SortOrder
    batch?: SortOrderInput | SortOrder
    alcoholContent?: SortOrderInput | SortOrder
    energyValueKJ?: SortOrderInput | SortOrder
    energyValueKcal?: SortOrderInput | SortOrder
    fat?: SortOrderInput | SortOrder
    saturatedFat?: SortOrderInput | SortOrder
    carbs?: SortOrderInput | SortOrder
    sugars?: SortOrderInput | SortOrder
    protein?: SortOrderInput | SortOrder
    salt?: SortOrderInput | SortOrder
    ingredients?: SortOrderInput | SortOrder
    additionalInfo?: SortOrderInput | SortOrder
    allergens?: SortOrderInput | SortOrder
    wineRegion?: SortOrderInput | SortOrder
    wineSubregion?: SortOrderInput | SortOrder
    wineVillage?: SortOrderInput | SortOrder
    wineTract?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wineryId?: SortOrder
    _count?: WineCountOrderByAggregateInput
    _avg?: WineAvgOrderByAggregateInput
    _max?: WineMaxOrderByAggregateInput
    _min?: WineMinOrderByAggregateInput
    _sum?: WineSumOrderByAggregateInput
  }

  export type WineScalarWhereWithAggregatesInput = {
    AND?: WineScalarWhereWithAggregatesInput | WineScalarWhereWithAggregatesInput[]
    OR?: WineScalarWhereWithAggregatesInput[]
    NOT?: WineScalarWhereWithAggregatesInput | WineScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Wine"> | string
    name?: StringWithAggregatesFilter<"Wine"> | string
    vintage?: IntNullableWithAggregatesFilter<"Wine"> | number | null
    batch?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    alcoholContent?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    energyValueKJ?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    energyValueKcal?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    fat?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    saturatedFat?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    carbs?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    sugars?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    protein?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    salt?: FloatNullableWithAggregatesFilter<"Wine"> | number | null
    ingredients?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    additionalInfo?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    allergens?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    wineRegion?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    wineSubregion?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    wineVillage?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    wineTract?: StringNullableWithAggregatesFilter<"Wine"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Wine"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Wine"> | Date | string
    wineryId?: StringWithAggregatesFilter<"Wine"> | string
  }

  export type WineryCreateInput = {
    id?: string
    name: string
    slug: string
    email: string
    passwordHash: string
    passwordSalt: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    wines?: WineCreateNestedManyWithoutWineryInput
  }

  export type WineryUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    email: string
    passwordHash: string
    passwordSalt: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    wines?: WineUncheckedCreateNestedManyWithoutWineryInput
  }

  export type WineryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    passwordSalt?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wines?: WineUpdateManyWithoutWineryNestedInput
  }

  export type WineryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    passwordSalt?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wines?: WineUncheckedUpdateManyWithoutWineryNestedInput
  }

  export type WineryCreateManyInput = {
    id?: string
    name: string
    slug: string
    email: string
    passwordHash: string
    passwordSalt: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WineryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    passwordSalt?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    passwordSalt?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineCreateInput = {
    id?: string
    name: string
    vintage?: number | null
    batch?: string | null
    alcoholContent?: number | null
    energyValueKJ?: number | null
    energyValueKcal?: number | null
    fat?: number | null
    saturatedFat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
    ingredients?: string | null
    additionalInfo?: string | null
    allergens?: string | null
    wineRegion?: string | null
    wineSubregion?: string | null
    wineVillage?: string | null
    wineTract?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    winery: WineryCreateNestedOneWithoutWinesInput
  }

  export type WineUncheckedCreateInput = {
    id?: string
    name: string
    vintage?: number | null
    batch?: string | null
    alcoholContent?: number | null
    energyValueKJ?: number | null
    energyValueKcal?: number | null
    fat?: number | null
    saturatedFat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
    ingredients?: string | null
    additionalInfo?: string | null
    allergens?: string | null
    wineRegion?: string | null
    wineSubregion?: string | null
    wineVillage?: string | null
    wineTract?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    wineryId: string
  }

  export type WineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    winery?: WineryUpdateOneRequiredWithoutWinesNestedInput
  }

  export type WineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wineryId?: StringFieldUpdateOperationsInput | string
  }

  export type WineCreateManyInput = {
    id?: string
    name: string
    vintage?: number | null
    batch?: string | null
    alcoholContent?: number | null
    energyValueKJ?: number | null
    energyValueKcal?: number | null
    fat?: number | null
    saturatedFat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
    ingredients?: string | null
    additionalInfo?: string | null
    allergens?: string | null
    wineRegion?: string | null
    wineSubregion?: string | null
    wineVillage?: string | null
    wineTract?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    wineryId: string
  }

  export type WineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wineryId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type WineListRelationFilter = {
    every?: WineWhereInput
    some?: WineWhereInput
    none?: WineWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WineOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WineryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    passwordSalt?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WineryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    passwordSalt?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WineryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    passwordSalt?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type WineryScalarRelationFilter = {
    is?: WineryWhereInput
    isNot?: WineryWhereInput
  }

  export type WineWineryIdNameVintageBatchCompoundUniqueInput = {
    wineryId: string
    name: string
    vintage: number
    batch: string
  }

  export type WineCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    vintage?: SortOrder
    batch?: SortOrder
    alcoholContent?: SortOrder
    energyValueKJ?: SortOrder
    energyValueKcal?: SortOrder
    fat?: SortOrder
    saturatedFat?: SortOrder
    carbs?: SortOrder
    sugars?: SortOrder
    protein?: SortOrder
    salt?: SortOrder
    ingredients?: SortOrder
    additionalInfo?: SortOrder
    allergens?: SortOrder
    wineRegion?: SortOrder
    wineSubregion?: SortOrder
    wineVillage?: SortOrder
    wineTract?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wineryId?: SortOrder
  }

  export type WineAvgOrderByAggregateInput = {
    vintage?: SortOrder
    alcoholContent?: SortOrder
    energyValueKJ?: SortOrder
    energyValueKcal?: SortOrder
    fat?: SortOrder
    saturatedFat?: SortOrder
    carbs?: SortOrder
    sugars?: SortOrder
    protein?: SortOrder
    salt?: SortOrder
  }

  export type WineMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    vintage?: SortOrder
    batch?: SortOrder
    alcoholContent?: SortOrder
    energyValueKJ?: SortOrder
    energyValueKcal?: SortOrder
    fat?: SortOrder
    saturatedFat?: SortOrder
    carbs?: SortOrder
    sugars?: SortOrder
    protein?: SortOrder
    salt?: SortOrder
    ingredients?: SortOrder
    additionalInfo?: SortOrder
    allergens?: SortOrder
    wineRegion?: SortOrder
    wineSubregion?: SortOrder
    wineVillage?: SortOrder
    wineTract?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wineryId?: SortOrder
  }

  export type WineMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    vintage?: SortOrder
    batch?: SortOrder
    alcoholContent?: SortOrder
    energyValueKJ?: SortOrder
    energyValueKcal?: SortOrder
    fat?: SortOrder
    saturatedFat?: SortOrder
    carbs?: SortOrder
    sugars?: SortOrder
    protein?: SortOrder
    salt?: SortOrder
    ingredients?: SortOrder
    additionalInfo?: SortOrder
    allergens?: SortOrder
    wineRegion?: SortOrder
    wineSubregion?: SortOrder
    wineVillage?: SortOrder
    wineTract?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wineryId?: SortOrder
  }

  export type WineSumOrderByAggregateInput = {
    vintage?: SortOrder
    alcoholContent?: SortOrder
    energyValueKJ?: SortOrder
    energyValueKcal?: SortOrder
    fat?: SortOrder
    saturatedFat?: SortOrder
    carbs?: SortOrder
    sugars?: SortOrder
    protein?: SortOrder
    salt?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type WineCreateNestedManyWithoutWineryInput = {
    create?: XOR<WineCreateWithoutWineryInput, WineUncheckedCreateWithoutWineryInput> | WineCreateWithoutWineryInput[] | WineUncheckedCreateWithoutWineryInput[]
    connectOrCreate?: WineCreateOrConnectWithoutWineryInput | WineCreateOrConnectWithoutWineryInput[]
    createMany?: WineCreateManyWineryInputEnvelope
    connect?: WineWhereUniqueInput | WineWhereUniqueInput[]
  }

  export type WineUncheckedCreateNestedManyWithoutWineryInput = {
    create?: XOR<WineCreateWithoutWineryInput, WineUncheckedCreateWithoutWineryInput> | WineCreateWithoutWineryInput[] | WineUncheckedCreateWithoutWineryInput[]
    connectOrCreate?: WineCreateOrConnectWithoutWineryInput | WineCreateOrConnectWithoutWineryInput[]
    createMany?: WineCreateManyWineryInputEnvelope
    connect?: WineWhereUniqueInput | WineWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type WineUpdateManyWithoutWineryNestedInput = {
    create?: XOR<WineCreateWithoutWineryInput, WineUncheckedCreateWithoutWineryInput> | WineCreateWithoutWineryInput[] | WineUncheckedCreateWithoutWineryInput[]
    connectOrCreate?: WineCreateOrConnectWithoutWineryInput | WineCreateOrConnectWithoutWineryInput[]
    upsert?: WineUpsertWithWhereUniqueWithoutWineryInput | WineUpsertWithWhereUniqueWithoutWineryInput[]
    createMany?: WineCreateManyWineryInputEnvelope
    set?: WineWhereUniqueInput | WineWhereUniqueInput[]
    disconnect?: WineWhereUniqueInput | WineWhereUniqueInput[]
    delete?: WineWhereUniqueInput | WineWhereUniqueInput[]
    connect?: WineWhereUniqueInput | WineWhereUniqueInput[]
    update?: WineUpdateWithWhereUniqueWithoutWineryInput | WineUpdateWithWhereUniqueWithoutWineryInput[]
    updateMany?: WineUpdateManyWithWhereWithoutWineryInput | WineUpdateManyWithWhereWithoutWineryInput[]
    deleteMany?: WineScalarWhereInput | WineScalarWhereInput[]
  }

  export type WineUncheckedUpdateManyWithoutWineryNestedInput = {
    create?: XOR<WineCreateWithoutWineryInput, WineUncheckedCreateWithoutWineryInput> | WineCreateWithoutWineryInput[] | WineUncheckedCreateWithoutWineryInput[]
    connectOrCreate?: WineCreateOrConnectWithoutWineryInput | WineCreateOrConnectWithoutWineryInput[]
    upsert?: WineUpsertWithWhereUniqueWithoutWineryInput | WineUpsertWithWhereUniqueWithoutWineryInput[]
    createMany?: WineCreateManyWineryInputEnvelope
    set?: WineWhereUniqueInput | WineWhereUniqueInput[]
    disconnect?: WineWhereUniqueInput | WineWhereUniqueInput[]
    delete?: WineWhereUniqueInput | WineWhereUniqueInput[]
    connect?: WineWhereUniqueInput | WineWhereUniqueInput[]
    update?: WineUpdateWithWhereUniqueWithoutWineryInput | WineUpdateWithWhereUniqueWithoutWineryInput[]
    updateMany?: WineUpdateManyWithWhereWithoutWineryInput | WineUpdateManyWithWhereWithoutWineryInput[]
    deleteMany?: WineScalarWhereInput | WineScalarWhereInput[]
  }

  export type WineryCreateNestedOneWithoutWinesInput = {
    create?: XOR<WineryCreateWithoutWinesInput, WineryUncheckedCreateWithoutWinesInput>
    connectOrCreate?: WineryCreateOrConnectWithoutWinesInput
    connect?: WineryWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type WineryUpdateOneRequiredWithoutWinesNestedInput = {
    create?: XOR<WineryCreateWithoutWinesInput, WineryUncheckedCreateWithoutWinesInput>
    connectOrCreate?: WineryCreateOrConnectWithoutWinesInput
    upsert?: WineryUpsertWithoutWinesInput
    connect?: WineryWhereUniqueInput
    update?: XOR<XOR<WineryUpdateToOneWithWhereWithoutWinesInput, WineryUpdateWithoutWinesInput>, WineryUncheckedUpdateWithoutWinesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type WineCreateWithoutWineryInput = {
    id?: string
    name: string
    vintage?: number | null
    batch?: string | null
    alcoholContent?: number | null
    energyValueKJ?: number | null
    energyValueKcal?: number | null
    fat?: number | null
    saturatedFat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
    ingredients?: string | null
    additionalInfo?: string | null
    allergens?: string | null
    wineRegion?: string | null
    wineSubregion?: string | null
    wineVillage?: string | null
    wineTract?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WineUncheckedCreateWithoutWineryInput = {
    id?: string
    name: string
    vintage?: number | null
    batch?: string | null
    alcoholContent?: number | null
    energyValueKJ?: number | null
    energyValueKcal?: number | null
    fat?: number | null
    saturatedFat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
    ingredients?: string | null
    additionalInfo?: string | null
    allergens?: string | null
    wineRegion?: string | null
    wineSubregion?: string | null
    wineVillage?: string | null
    wineTract?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WineCreateOrConnectWithoutWineryInput = {
    where: WineWhereUniqueInput
    create: XOR<WineCreateWithoutWineryInput, WineUncheckedCreateWithoutWineryInput>
  }

  export type WineCreateManyWineryInputEnvelope = {
    data: WineCreateManyWineryInput | WineCreateManyWineryInput[]
  }

  export type WineUpsertWithWhereUniqueWithoutWineryInput = {
    where: WineWhereUniqueInput
    update: XOR<WineUpdateWithoutWineryInput, WineUncheckedUpdateWithoutWineryInput>
    create: XOR<WineCreateWithoutWineryInput, WineUncheckedCreateWithoutWineryInput>
  }

  export type WineUpdateWithWhereUniqueWithoutWineryInput = {
    where: WineWhereUniqueInput
    data: XOR<WineUpdateWithoutWineryInput, WineUncheckedUpdateWithoutWineryInput>
  }

  export type WineUpdateManyWithWhereWithoutWineryInput = {
    where: WineScalarWhereInput
    data: XOR<WineUpdateManyMutationInput, WineUncheckedUpdateManyWithoutWineryInput>
  }

  export type WineScalarWhereInput = {
    AND?: WineScalarWhereInput | WineScalarWhereInput[]
    OR?: WineScalarWhereInput[]
    NOT?: WineScalarWhereInput | WineScalarWhereInput[]
    id?: StringFilter<"Wine"> | string
    name?: StringFilter<"Wine"> | string
    vintage?: IntNullableFilter<"Wine"> | number | null
    batch?: StringNullableFilter<"Wine"> | string | null
    alcoholContent?: FloatNullableFilter<"Wine"> | number | null
    energyValueKJ?: FloatNullableFilter<"Wine"> | number | null
    energyValueKcal?: FloatNullableFilter<"Wine"> | number | null
    fat?: FloatNullableFilter<"Wine"> | number | null
    saturatedFat?: FloatNullableFilter<"Wine"> | number | null
    carbs?: FloatNullableFilter<"Wine"> | number | null
    sugars?: FloatNullableFilter<"Wine"> | number | null
    protein?: FloatNullableFilter<"Wine"> | number | null
    salt?: FloatNullableFilter<"Wine"> | number | null
    ingredients?: StringNullableFilter<"Wine"> | string | null
    additionalInfo?: StringNullableFilter<"Wine"> | string | null
    allergens?: StringNullableFilter<"Wine"> | string | null
    wineRegion?: StringNullableFilter<"Wine"> | string | null
    wineSubregion?: StringNullableFilter<"Wine"> | string | null
    wineVillage?: StringNullableFilter<"Wine"> | string | null
    wineTract?: StringNullableFilter<"Wine"> | string | null
    createdAt?: DateTimeFilter<"Wine"> | Date | string
    updatedAt?: DateTimeFilter<"Wine"> | Date | string
    wineryId?: StringFilter<"Wine"> | string
  }

  export type WineryCreateWithoutWinesInput = {
    id?: string
    name: string
    slug: string
    email: string
    passwordHash: string
    passwordSalt: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WineryUncheckedCreateWithoutWinesInput = {
    id?: string
    name: string
    slug: string
    email: string
    passwordHash: string
    passwordSalt: string
    address?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WineryCreateOrConnectWithoutWinesInput = {
    where: WineryWhereUniqueInput
    create: XOR<WineryCreateWithoutWinesInput, WineryUncheckedCreateWithoutWinesInput>
  }

  export type WineryUpsertWithoutWinesInput = {
    update: XOR<WineryUpdateWithoutWinesInput, WineryUncheckedUpdateWithoutWinesInput>
    create: XOR<WineryCreateWithoutWinesInput, WineryUncheckedCreateWithoutWinesInput>
    where?: WineryWhereInput
  }

  export type WineryUpdateToOneWithWhereWithoutWinesInput = {
    where?: WineryWhereInput
    data: XOR<WineryUpdateWithoutWinesInput, WineryUncheckedUpdateWithoutWinesInput>
  }

  export type WineryUpdateWithoutWinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    passwordSalt?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineryUncheckedUpdateWithoutWinesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    passwordSalt?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineCreateManyWineryInput = {
    id?: string
    name: string
    vintage?: number | null
    batch?: string | null
    alcoholContent?: number | null
    energyValueKJ?: number | null
    energyValueKcal?: number | null
    fat?: number | null
    saturatedFat?: number | null
    carbs?: number | null
    sugars?: number | null
    protein?: number | null
    salt?: number | null
    ingredients?: string | null
    additionalInfo?: string | null
    allergens?: string | null
    wineRegion?: string | null
    wineSubregion?: string | null
    wineVillage?: string | null
    wineTract?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WineUpdateWithoutWineryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineUncheckedUpdateWithoutWineryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WineUncheckedUpdateManyWithoutWineryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vintage?: NullableIntFieldUpdateOperationsInput | number | null
    batch?: NullableStringFieldUpdateOperationsInput | string | null
    alcoholContent?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKJ?: NullableFloatFieldUpdateOperationsInput | number | null
    energyValueKcal?: NullableFloatFieldUpdateOperationsInput | number | null
    fat?: NullableFloatFieldUpdateOperationsInput | number | null
    saturatedFat?: NullableFloatFieldUpdateOperationsInput | number | null
    carbs?: NullableFloatFieldUpdateOperationsInput | number | null
    sugars?: NullableFloatFieldUpdateOperationsInput | number | null
    protein?: NullableFloatFieldUpdateOperationsInput | number | null
    salt?: NullableFloatFieldUpdateOperationsInput | number | null
    ingredients?: NullableStringFieldUpdateOperationsInput | string | null
    additionalInfo?: NullableStringFieldUpdateOperationsInput | string | null
    allergens?: NullableStringFieldUpdateOperationsInput | string | null
    wineRegion?: NullableStringFieldUpdateOperationsInput | string | null
    wineSubregion?: NullableStringFieldUpdateOperationsInput | string | null
    wineVillage?: NullableStringFieldUpdateOperationsInput | string | null
    wineTract?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}