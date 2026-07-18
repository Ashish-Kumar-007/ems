import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Singleton Pattern: Single PrismaClient instance shared across the application.
 * Prevents connection pool exhaustion from multiple client instances.
 */
class Database {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ],
      });

      Database.instance.$on('query' as never, (e: any) => {
        logger.debug(`Query: ${e.query} — Duration: ${e.duration}ms`);
      });

      logger.info('Prisma client initialized');
    }
    return Database.instance;
  }

  public static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      logger.info('Database disconnected');
    }
  }
}

export const prisma = Database.getInstance();
export default Database;
