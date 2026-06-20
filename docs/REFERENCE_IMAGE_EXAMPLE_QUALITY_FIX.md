# PromptVerse Reference-Image & Example Quality Fix

## Hard rules
- Templates may contain placeholders.
- `examplePrompt` must contain zero bracket placeholders.
- If an example contains placeholders, regenerate before publish.
- Image prompts should default to realistic professional, editorial, commercial, lifestyle, luxury, documentary, travel, or portrait photography unless explicitly stylized.
- At least 25% of image prompts must support one or more of these placeholders: `[USER_PHOTO]`, `[FACE_REFERENCE]`, `[CHARACTER_REFERENCE]`, `[PRODUCT_REFERENCE]`, `[STYLE_REFERENCE]`, `[POSE_REFERENCE]`, `[COMPOSITION_REFERENCE]`, `[BRAND_REFERENCE]`, `[ENVIRONMENT_REFERENCE]`.

## Priority use cases
- LinkedIn headshots, executive portraits, startup founder portraits, conference speaker portraits
- Magazine covers, fashion editorials, wedding photography, travel photography
- Product advertising, luxury branding, restaurant advertising, real estate marketing
- Personal branding, podcast branding, YouTube thumbnails, profile pictures, avatar generation

## Validation gates
1. Example contains zero placeholders.
2. Prompt maps to a real-world commercial or professional use case.
3. Output realism is the default unless the prompt explicitly requests another style.
4. Reference-image support is included where appropriate.
5. Structure feels like a premium marketplace prompt, not template spam.
