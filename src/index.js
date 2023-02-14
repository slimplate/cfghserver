import handlerCors from './cors.js'
import handlerGh from './gh.js'
import { ThrowableRouter } from 'itty-router-extras'

const router = ThrowableRouter()
handlerCors(router)
handlerGh(router)

router.all('*', () => new Response('Nothing to see here.'))

export default {
  async fetch (request, env, ctx) {
    const req = { ...request, env, ctx, req: request }
    return router.handle(req)
  }
}
