import mongoose from 'mongoose'

/** Strip quotes if MONGO_URI was pasted with surrounding quotes in Vercel UI. */
export function trimMongoUri(uri) {
  if (uri == null) return ''
  let s = String(uri).trim()
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim()
  }
  return s
}

const globalForMongoose = globalThis
globalForMongoose.__linguatechMongoose ??= { connectPromise: null }

/**
 * Serverless-friendly Mongo (student-commission style): reuse when connected, wait when connecting,
 * dedupe parallel cold starts, IPv4 for Atlas compatibility.
 */
export const connectDB = async () => {
  const uri = trimMongoUri(process.env.MONGO_URI)
  if (!uri) {
    throw new Error('MONGO_URI is not defined')
  }

  if (mongoose.connection.readyState === 1) {
    return
  }

  if (mongoose.connection.readyState === 2 && typeof mongoose.connection.asPromise === 'function') {
    await mongoose.connection.asPromise()
    return
  }

  if (!globalForMongoose.__linguatechMongoose.connectPromise) {
    globalForMongoose.__linguatechMongoose.connectPromise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
        socketTimeoutMS: 45_000,
        family: 4,
      })
      .then(() => mongoose)
      .catch((err) => {
        globalForMongoose.__linguatechMongoose.connectPromise = null
        throw err
      })
  }

  await globalForMongoose.__linguatechMongoose.connectPromise
}
