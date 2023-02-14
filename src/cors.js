// this acts as a cors proxy

export default function (router) {
  router.all('/api/cors/:url+', async req => {
    if (!req.params.url) {
      return new Response(null, {
        status: 500,
        statusText: 'Please set the URL you are requesting.'
      })
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
      'Access-Control-Max-Age': '86400'
    }

    if (
      req.headers.get('Origin') !== null &&
        req.headers.get('Access-Control-Request-Method') !== null &&
        req.headers.get('Access-Control-Request-Headers') !== null
    ) {
      // Handle CORS preflight requests.
      return new Response(null, {
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Headers': req.headers.get(
            'Access-Control-Request-Headers'
          )
        }
      })
    }

    const apiUrl = new URL(req.url.toString().replace(/^.+\/api\/cors/, 'https:/'))
    const request = new Request(apiUrl, req)

    if (!req.headers.get('user-agent') || !req.headers.get('user-agent').startsWith('git/')) {
      request.headers.set('user-agent', 'git/@isomorphic-git/cors-proxy')
    }

    request.headers.set('Origin', apiUrl.origin)
    request.headers.set('Referer', apiUrl.toString())
    request.headers.set('Host', apiUrl.hostname)
    let response = await fetch(request)
    response = new Response(response.body, response)

    if (response.headers.has('Location')) {
      const newUrl = response.headers.get('Location').replace(/^https?:\//, '/api/cors')
      response.headers.set('Location', newUrl)
    }

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.append('Vary', 'Origin')
    return response
  })
}
