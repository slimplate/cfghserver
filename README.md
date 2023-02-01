This is a cloudflare worker that does 2 things:

- Provide oath callbacks for Github Auth
- Proxy authenticated requests for github files

### auth

Add a Github OAuth app (under "Developer Settings") set the redirect URL to wherever this is deployed (`https://cfghserver.YOURNAME.workers.dev`.)

Edit secrets.json to look like this:

```json
{
  "GITHUB_CLIENT": "YOURS",
  "GITHUB_SECRET": "YOURS",
  "REDIRECT_URLS": "http://localhost:5173/"
}
```

`REDIRECT_URLS` is comma-seperated list, and it doesn't have to match GitHub's, just authorized URLs to redirect to (with oauth token.)

Then run `wrangler secret:bulk secrets.json`

In your app, hit `https://cfghserver.YOURNAME.workers.dev?code=XXXX&redir=http%3A%2F%2Flocalhost%3A5173%2F&scope=WHATEVER` to get the oauth token (in get-param `gh`.) `code` comes from the oauth-flow, for the user. Read more [here](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps).


## proxy

I am using ideas from [here](https://www.npmjs.com/package/@isomorphic-git/cors-proxy).

Essentially, you can use [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git) in the browser.