import { MongoClient } from 'mongodb';

export function buildDatabaseConn() {
  const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    TEST_DATABASE_NAME,
    NODE_ENV,
  } = process.env;

  const databaseName = NODE_ENV === 'test'
    ? TEST_DATABASE_NAME
    : DATABASE_NAME;

  return `mongodb://${DATABASE_HOST}:${DATABASE_PORT}/${databaseName}`;
}

export async function getDatabaseSession(conn: string) {
  try {
    return await MongoClient.connect(conn);
  } catch (e) {
    throw new Error(e);
  }
}
