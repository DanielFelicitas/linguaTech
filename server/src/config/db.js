import mongoose from 'mongoose'

/**
 * Vercel serverless: reuse one connect promise per isolate; avoid slow repeat handshakes.
 * Bounded timeouts prevent hanging until the platform kills the function.
 */
const globalForMongoose = globalThis
globalForMongoose.__linguatechMongoose ??= { connectPromise: null }

export const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not defined')
  }

  if (mongoose.connection.readyState === 1) {
    return
  }

  if (!globalForMongoose.__linguatechMongoose.connectPromise) {
    globalForMongoose.__linguatechMongoose.connectPromise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 12_000,
        connectTimeoutMS: 12_000,
        socketTimeoutMS: 45_000,
      })
      .then(() => mongoose)
      .catch((err) => {
        globalForMongoose.__linguatechMongoose.connectPromise = null
        throw err
      })
  }

  await globalForMongoose.__linguatechMongoose.connectPromise
}
