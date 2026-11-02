import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/menuqr';

  try {
    // First attempt to connect to standard or env MONGODB_URI with a 3 second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (error) {
    console.warn(`[Database] Local/Configured MongoDB connection failed (${error.message}).`);
    console.log(`[Database] Starting embedded persistent MongoDB server for seamless zero-setup development...`);

    try {
      // Ensure local cache & data directories within workspace
      const localDownloadDir = path.resolve('./.mongo-binaries');
      const localDataDir = path.resolve('./.mongo-data');

      if (!fs.existsSync(localDownloadDir)) {
        fs.mkdirSync(localDownloadDir, { recursive: true });
      }
      if (!fs.existsSync(localDataDir)) {
        fs.mkdirSync(localDataDir, { recursive: true });
      }

      process.env.MONGOMS_DOWNLOAD_DIR = localDownloadDir;

      mongoMemoryServer = await MongoMemoryServer.create({
        binary: {
          downloadDir: localDownloadDir,
        },
        instance: {
          dbPath: localDataDir,
          storageEngine: 'wiredTiger',
        },
      });

      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to persistent embedded MongoDB at: ${inMemoryUri} (Data: ${localDataDir})`);
    } catch (memError) {
      console.error(`[Database] Failed to start embedded MongoDB:`, memError);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
