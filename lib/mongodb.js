import { MongoClient } from 'mongodb';

const uri = process.env.DB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('Missing DB_URI environment variable. Add it to .env');
}

let clientPromise;

// In dev, Next.js hot-reloads modules, which would otherwise open a new
// MongoDB connection on every edit. Cache the connection on the global
// object so it survives HMR reloads.
if (process.env.NODE_ENV === 'development') {
  if (!global._savoyMongoClientPromise) {
    const client = new MongoClient(uri);
    global._savoyMongoClientPromise = client.connect();
  }
  clientPromise = global._savoyMongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getMenuCollection() {
  const db = await getDb();
  const collectionName = process.env.DB_COLLECTION;
  if (!collectionName) {
    throw new Error('Missing DB_COLLECTION environment variable. Add it to .env');
  }
  return db.collection(collectionName);
}

export default clientPromise;
