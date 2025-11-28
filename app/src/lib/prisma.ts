import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { getRequestContext } from '@cloudflare/next-on-pages'


let prismaInstance: PrismaClient | undefined

export const getPrisma = () => {
  // If we already have an instance, return it
  if (prismaInstance) return prismaInstance

  try {
    // Try to get Cloudflare context
    const { env } = getRequestContext() as unknown as { env: Env }
    if (env.DB) {
      const adapter = new PrismaD1(env.DB)
      prismaInstance = new PrismaClient({ adapter })
      return prismaInstance
    }
  } catch (e) {
    // Not in Cloudflare Pages context or getRequestContext failed
  }

  // Fallback for local development (standard Prisma Client)
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }

  return prismaInstance
}

