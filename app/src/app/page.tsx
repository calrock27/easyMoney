import { getRequestContext } from '@cloudflare/next-on-pages'
import { HomeClient } from './home-client'

export const runtime = 'edge'

export default function Home() {
  let isDemoMode = false

  try {
    const { env } = getRequestContext() as unknown as { env: Env }
    if (env.DB) {
      isDemoMode = true
    }
  } catch (e) {
    // Not in Cloudflare Pages context
  }

  return <HomeClient isDemoMode={isDemoMode} />
}
