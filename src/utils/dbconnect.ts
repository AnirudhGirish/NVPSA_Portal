import mongoose from "mongoose";

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var _mongoose: MongooseConnection | undefined;
}

const cached: MongooseConnection = global._mongoose ?? {
  conn: null,
  promise: null,
};

if (!global._mongoose) {
  global._mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define MONGODB_URI in the environment");
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("Error connecting to DB:", error);
    throw error;
  }

  return cached.conn;
}

export { connectDB };
export default connectDB;
