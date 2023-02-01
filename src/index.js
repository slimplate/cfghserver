export default {
  async fetch (request, env, ctx) {
    const { REDIRECT_URLS, GITHUB_CLIENT, GITHUB_SECRET } = env
    const { searchParams } = new URL(request.url)

    if (!REDIRECT_URLS) {
      return new Response('Set REDIRECT_URLS', { status: 500 })
    }
    if (!GITHUB_CLIENT) {
      return new Response('Set GITHUB_CLIENT', { status: 500 })
    }
    if (!GITHUB_SECRET) {
      return new Response('Set GITHUB_SECRET', { status: 500 })
    }

    const allowedURLs = REDIRECT_URLS.split(',').map(s => s.trim())

    const redir = searchParams.get('redir')
    const state = searchParams.get('state')
    const code = searchParams.get('code')
    const scope = searchParams.get('scope') || 'repo'

    // user initiated
    if (redir) {
      if (allowedURLs.includes(redir)) {
        return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT}&state=${encodeURIComponent(redir)}&scope=${encodeURIComponent(scope)}`, 302)
      } else {
        console.error(`URL not authorized: ${redir}`, allowedURLs)
        return new Response('URL not authorized.', { status: 500 })
      }
    }

    // first callback from GH
    if (code && state) {
      const gh = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        body: JSON.stringify({
          client_id: GITHUB_CLIENT,
          client_secret: GITHUB_SECRET,
          code
        }),
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        }
      }).then(r => r.json())

      if (gh.error) {
        return new Response(JSON.stringify(gh), { status: 500, headers: { 'content-type': 'application/json' } })
      }

      if (gh.access_token) {
        if (allowedURLs.includes(state)) {
          return Response.redirect(`${state}?gh=${gh.access_token}`, 302)
        } else {
          console.error(`URL not authorized: ${redir}`, allowedURLs)
          return new Response('URL not authorized.', { status: 500 })
        }
      }
    }

    return new Response('Nothing to see here.')
  }
}
