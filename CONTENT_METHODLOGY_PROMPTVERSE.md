# PromptVerse Content Quality Methodology

This document defines how PromptVerse prompt datasets must be authored so the library feels like a curated premium marketplace, not an AI prompt dump.

Goals:
- Prioritize realistic, commercially useful prompts.
- Use distinct frameworks per category (no shared skeleton sentences).
- Treat image-reference workflows as first-class.
- Make prompts tool-aware (Midjourney, Flux, SD, Kling, Veo, Runway, Suno, Udio, ElevenLabs, ChatGPT, Claude, Gemini).
- Scale to tens of thousands of prompts without repetition.

## 1. Image prompt distribution

Across all image prompts (all files under `content/image/`), target this mix:

- Realistic Photography – 35%
- Commercial & Advertising – 20%
- Product Photography – 10%
- Portrait Photography – 10%
- Architecture – 5%
- Travel – 5%
- Food – 5%
- Nature – 5%
- Fantasy – 3%
- Anime – 2% (hard cap)

Any prompt whose `subcategory` or `tags` mention "anime" counts as Anime.
If Anime exceeds 2% of all image prompts, the dataset must be corrected before release.

## 2. Category-specific frameworks

Each image bucket has its own template frame. Authors must not reuse one frame across buckets.

### 2.1 Realistic Photography

Template:
> Capture a realistic [SUBJECT] in [ENVIRONMENT] using a [CAMERA_TYPE] with a [LENS_FOCAL_LENGTH]mm lens at [APERTURE], lit by [LIGHTING_CONDITION], composed as [COMPOSITION_STYLE], conveying a [MOOD] atmosphere.

### 2.2 Commercial & Advertising

Template:
> Create a high-end advertising image for [PRODUCT] positioned as [BRAND_POSITIONING] targeting [TARGET_AUDIENCE], shot in [ENVIRONMENT] with [LIGHTING_STYLE], emphasizing [VISUAL_HOOK], with copy-safe negative space on [NEGATIVE_SPACE_REGION] for [CTA_TEXT].

### 2.3 Product Photography

Template:
> Photograph [PRODUCT] for an e-commerce catalog on [BACKGROUND_STYLE] with [LIGHTING_SETUP], showing [ANGLE_DETAIL] and [KEY_FEATURES], ensuring clean edges, accurate color, and subtle reflections suitable for [PLATFORM].

### 2.4 Portrait Photography

Template:
> Create a portrait of [PERSON_ROLE] in [ENVIRONMENT] using [CAMERA_SETUP] and [LIGHTING_SETUP], framed at [FRAMING_TYPE], emphasizing [FACIAL_EXPRESSION] and [PERSONAL_BRAND_TRAIT] for [USE_CASE] such as [PLATFORM].

### 2.5 Architecture

Template:
> Photograph [BUILDING_TYPE] built with [PRIMARY_MATERIALS] in [ARCHITECTURAL_STYLE], located in [ENVIRONMENT], captured at [TIME_OF_DAY] with [LIGHTING_CONDITION], using a [CAMERA_ANGLE] that emphasizes [DESIGN_FEATURE].

### 2.6 Travel

Template:
> Capture [DESTINATION] during [SEASON] from [CAMERA_PERSPECTIVE], showing [CULTURAL_ELEMENTS] and [LANDMARK_FEATURES], under [ATMOSPHERE] conditions at [TIME_OF_DAY], styled for [PUBLICATION_TYPE] travel editorial.

### 2.7 Food

Template:
> Photograph [DISH] plated in [PLATING_STYLE] on [TABLETOP_SURFACE], lit with [LIGHTING_STYLE], with [BACKGROUND_ELEMENTS] hinting at [RESTAURANT_STYLE], styled for [OUTPUT_TYPE] such as [PLATFORM_OR_MENU_TYPE].

### 2.8 Nature

Template:
> Capture [SUBJECT_SPECIES] in [HABITAT_TYPE] during [TIME_OF_DAY], using a [LENS_TYPE] at [FOCAL_LENGTH]mm, highlighting [BEHAVIOR_OR_DETAIL] with [LIGHTING_STYLE] and [COMPOSITION_TECHNIQUE].

### 2.9 Fantasy

Template:
> Create a fantasy scene featuring [FANTASY_SUBJECT] in [FANTASY_ENVIRONMENT], designed with [WORLD_BUILDING_STYLE], lit like [CINEMATIC_REFERENCE], with [CAMERA_MOVEMENT_OR_ANGLE] and [COLOR_PALETTE_STYLE].

### 2.10 Anime (capped)

Template:
> In a polished anime style, illustrate [ANIME_SUBJECT] in [ANIME_ENVIRONMENT] with [ANIMATION_ERA] character design, [COLOR_PALETTE_STYLE] palette, and [CAMERA_ANGLE], styled for [OUTPUT_TYPE] such as [POSTER_OR_KEY_VISUAL].

Anime prompts must be rare, non-repetitive, and tied to real workflows (character sheets, pitch decks).

## 3. Image-reference workflows

Use these placeholders for reference-aware prompts:

- [REFERENCE_IMAGE]
- [USER_PHOTO]
- [FACE_REFERENCE]
- [CHARACTER_REFERENCE]
- [PRODUCT_REFERENCE]
- [STYLE_REFERENCE]
- [POSE_REFERENCE]
- [COMPOSITION_REFERENCE]
- [ENVIRONMENT_REFERENCE]

Example template:
> Using [USER_PHOTO] as the facial reference, create a professional corporate headshot wearing [OUTFIT_STYLE], photographed in [ENVIRONMENT], illuminated with [LIGHTING_SETUP], using [CAMERA_STYLE].

If a template uses any reference placeholder, the prompt should:
- Include a `reference-image` style tag.
- List tools that support image conditioning (for example `midjourney`, `flux`, `stable-diffusion`, `kling`, `veo`, `runway`).

## 4. Real-world use cases

Every prompt must support one or more real-world workflows such as:

- LinkedIn photos, corporate headshots, executive portraits.
- Wedding photography.
- Real estate and Airbnb marketing.
- Luxury product ads (watches, fragrance, jewelry, cars, hotels).
- Restaurant and bar promotions.
- Travel and tourism campaigns.
- Instagram, TikTok, and Shorts content.
- YouTube thumbnails and channel art.
- Movie posters and key art.
- Podcast covers and branding.
- Fitness and wellness advertising.
- E-commerce listings and catalog shots.
- Fashion lookbooks and editorial.
- Personal branding, speaker promo, pitch decks, social campaigns.

Encode this in `description`, `tags`, and `tools` for each record.

## 5. Tool-aware prompts

The `tools` array should reflect actual strengths:

- Image: `midjourney`, `flux`, `stable-diffusion`.
- Video: `kling`, `veo`, `runway`.
- Audio: `suno`, `udio`, `elevenlabs`.
- Chat: `chatgpt`, `claude`, `gemini`.

Write prompts with these tools in mind (composition and cinematic style for Midjourney, realism for Flux, sequential shot lists for Kling/Veo/Runway, genre and tempo for Suno/Udio, voice and script structure for ElevenLabs, reasoning and structure for ChatGPT/Claude/Gemini).

## 6. Quality check

The script at `scripts/content-quality-check.ts` checks distribution and basic metadata. Run:

```bash
npm run content:check
```

The check will:
- Print image-bucket shares vs. targets.
- Fail if Anime share exceeds 2% + a small tolerance.
- Warn about prompts with no tools.
- Warn about reference placeholders without reference-related tags.
