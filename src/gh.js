// this acts as a callback for github

export default function(router){
  router.get('/api/github/callback', async ({query, env}) => {
    const { REDIRECT_URLS, GITHUB_CLIENT, GITHUB_SECRET } = env

    const { state, code } = query

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
        const allowedURLs = REDIRECT_URLS.split(',').map(s => s.trim())
        if (allowedURLs.includes(state)) {
          return Response.redirect(`${state}?gh=${gh.access_token}`, 302)
        } else {
          console.error(`URL not authorized: ${redir}`, allowedURLs)
          return new Response('URL not authorized.', { status: 500 })
        }
      }
    }
  })

  router.get('/api/github', async ({query, env}) => {
    const { REDIRECT_URLS, GITHUB_CLIENT, GITHUB_SECRET } = env

    if (!REDIRECT_URLS) {
      return new Response('Set REDIRECT_URLS', { status: 500 })
    }
    if (!GITHUB_CLIENT) {
      return new Response('Set GITHUB_CLIENT', { status: 500 })
    }
    if (!GITHUB_SECRET) {
      return new Response('Set GITHUB_SECRET', { status: 500 })
    }

    const { redir, scope } = query

    // user initiated
    if (redir) {
      const allowedURLs = REDIRECT_URLS.split(',').map(s => s.trim())
      if (allowedURLs.includes(redir)) {
        return Response.redirect(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT}&state=${encodeURIComponent(redir)}&scope=${encodeURIComponent(scope)}`, 302)
      } else {
        console.error(`URL not authorized: ${redir}`, allowedURLs)
        return new Response('URL not authorized.', { status: 500 })
      }
    }
  })
}