This is a cloudflare worker that does 2 things:

- Provide ouath callbacks for Github Auth
- Proxy authenticated requests for github files

If you are interested in a vercel version, [checkout template-next](https://github.com/slimplate/template-next) which has this backend, and a frontend that uses it.

### auth

Add a Github OAuth app (under "Developer Settings") set the redirect URL to wherever this is deployed (`https://cfghserver.YOURNAME.workers.dev/api/github/callback`.)

Edit secrets.json to look like this:

```json
{
  "GITHUB_CLIENT": "YOURS",
  "GITHUB_SECRET": "YOURS",
  "REDIRECT_URLS": "http://localhost:5173/"
}
```

`REDIRECT_URLS` is comma-seperated list, and it doesn't have to match GitHub's, just authorized URLs to redirect to (with oauth token.)

Run `npm run deploy` for initial deployment.

Then run `wrangler secret:bulk secrets.json` to push your secrtets to the worker.

In your app, hit `https://cfghserver.YOURNAME.workers.dev/api/github?code=XXXX&redir=http%3A%2F%2Flocalhost%3A5173%2F&scope=WHATEVER` to get the oauth token (in get-param `gh`.) `code` comes from the oauth-flow, for the user. Read more [here](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps).

You can see example of using this for Github login [here](https://github.com/slimplate/template-vite)


## proxy

I am using ideas from [here](https://www.npmjs.com/package/@isomorphic-git/cors-proxy).

In your app, use URLs like `https://cfghserver.YOURNAME.workers.dev/api/cors/github.com/slimplate/private-tester.git/info/refs`