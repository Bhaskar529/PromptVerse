# PromptVerse

PromptVerse is a static-export Next.js website for a very large AI prompt library. It is designed to serve thousands of prompt pages, client-side category search, and strong SEO without any database, API, or authentication layer.

## Stack

- Next.js static export
- React
- TypeScript
- Tailwind CSS
- Pure file-based content loading from `content/`

## Folder structure

```txt
app/
  [typeSection]/
    [[...segments]]/
  search/
  tags/
  tools/
components/
lib/
content/
  image/
  video/
  audio/
  chat/
public/
  content/      <- mirrored from content/ at build time
  og/
scripts/
```

## Content model

Every content bundle should be a JSON file inside one of these directories:

```txt
content/
├── image/
├── video/
├── audio/
└── chat/
```

Examples:

```txt
content/image/anime.json
content/image/photography.json
content/video/commercials.json
content/audio/music.json
content/chat/coding.json
```

Supported prompt schema:

```json
{
  "id": "",
  "slug": "",
  "title": "",
  "description": "",
  "category": "",
  "subcategory": "",
  "tags": [],
  "tools": [],
  "difficulty": "",
  "template": "",
  "examplePrompt": ""
}
```

Each JSON file may be either:

- an array of prompt objects, or
- an object with a `prompts` array.

## Routing

Generated routes include:

- `/`
- `/search`
- `/image-prompts`
- `/video-prompts`
- `/audio-prompts`
- `/chat-prompts`
- `/image-prompts/[subcategory]`
- `/image-prompts/[slug]`
- `/video-prompts/[subcategory]`
- `/video-prompts/[slug]`
- `/audio-prompts/[subcategory]`
- `/audio-prompts/[slug]`
- `/chat-prompts/[subcategory]`
- `/chat-prompts/[slug]`
- `/tools/[tool]`
- `/tags/[tag]`

Note: because prompt pages and subcategory pages share the same depth, reserve subcategory names and avoid using identical prompt slugs such as `anime` inside the same type.

## Lazy-loading model

- Build-time pages read directly from `content/` with Node file access.
- Client-side search never downloads the full library.
- Search fetches only the currently selected category bundle from `/content/{type}/{subcategory}.json`.
- `scripts/sync-content.mjs` mirrors `content/` into `public/content/` before the build so the browser can request only the needed bundle.

## SEO system

- Static metadata on every route
- Canonical URLs
- Open Graph and Twitter cards
- `sitemap.ts`
- `robots.ts`
- JSON-LD for WebSite, CollectionPage, BreadcrumbList, CreativeWork, and FAQPage

## Build

1. Install dependencies:

```bash
npm install
```

2. Add your real content JSON bundles into `content/`.

3. Set your production domain:

```bash
NEXT_PUBLIC_SITE_URL=https://www.promptverse.com
```

4. Build static files:

```bash
npm run build
```

5. Deploy the generated `out/` directory to any static host.

## Notes

- No database.
- No auth.
- No CMS.
- No backend APIs.
- No full-library downloads on the client.
- Search is fully client-side and category-scoped.
