<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Destinations, enquiries and site settings live in Lovable Cloud tables; public pages read them via server functions in src/lib/public-data.functions.ts — never hardcode destination or contact data in components.
- Admin panel lives under /admin; protected pages are children of the pathless `admin._panel` layout (ssr:false, checks the admin role) and access data through the browser client, with RLS as the security boundary.
- Exactly one admin: created once via /admin/setup (server fn + unique index on the admin role); public sign-up is disabled.
- Primary GitHub account and repository: `faizancrypto1-a11y/Silver-Circle-Travel-Full-Website`. All future git pushes for this project must target this repository on `faizancrypto1-a11y`.

