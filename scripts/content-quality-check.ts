import fs from "fs";
import path from "path";

interface PromptRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  tools: string[];
  difficulty: string;
  template: string;
  examplePrompt: string;
}

const ROOT = path.join(process.cwd(), "content");

const IMAGE_BUCKET_TARGETS: Record<string, number> = {
  "realistic-photography": 0.35,
  "commercial-advertising": 0.2,
  "product-photography": 0.1,
  "portrait-photography": 0.1,
  architecture: 0.05,
  travel: 0.05,
  food: 0.05,
  nature: 0.05,
  fantasy: 0.03,
  anime: 0.02,
};

function loadJsonArray(filePath: string): PromptRecord[] {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return json as PromptRecord[];
    if (json && typeof json === "object" && Array.isArray((json as any).prompts)) {
      return (json as any).prompts as PromptRecord[];
    }
    return [];
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, (error as Error).message);
    return [];
  }
}

function classifyImagePrompt(prompt: PromptRecord, filePath: string): string {
  const haystack = [
    prompt.category,
    prompt.subcategory,
    prompt.tags.join(" "),
    filePath,
  ]
    .join(" ")
    .toLowerCase();

  if (haystack.includes("anime")) return "anime";
  if (haystack.includes("fantasy")) return "fantasy";
  if (haystack.includes("travel") || haystack.includes("tourism")) return "travel";
  if (haystack.includes("architecture") || haystack.includes("interior")) return "architecture";
  if (haystack.includes("food") || haystack.includes("restaurant") || haystack.includes("dish")) return "food";
  if (haystack.includes("product")) return "product-photography";
  if (haystack.includes("portrait") || haystack.includes("headshot")) return "portrait-photography";
  if (haystack.includes("campaign") || haystack.includes("advertising") || haystack.includes(" ad ")) return "commercial-advertising";
  if (haystack.includes("nature") || haystack.includes("wildlife") || haystack.includes("landscape")) return "nature";

  return "realistic-photography";
}

function hasReferencePlaceholder(text: string | undefined): boolean {
  const haystack = (text || "").toUpperCase();
  const keys = [
    "[REFERENCE_IMAGE]",
    "[USER_PHOTO]",
    "[FACE_REFERENCE]",
    "[CHARACTER_REFERENCE]",
    "[PRODUCT_REFERENCE]",
    "[STYLE_REFERENCE]",
    "[POSE_REFERENCE]",
    "[COMPOSITION_REFERENCE]",
    "[ENVIRONMENT_REFERENCE]",
  ];
  return keys.some((key) => haystack.includes(key));
}

function main() {
  const imageRoot = path.join(ROOT, "image");

  if (!fs.existsSync(imageRoot)) {
    console.error("No content/image directory found.");
    process.exit(1);
  }

  const bucketCounts: Record<string, number> = {};
  let totalImagePrompts = 0;
  let animeCount = 0;
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const file of fs.readdirSync(imageRoot)) {
    if (!file.endsWith(".json")) continue;
    const filePath = path.join(imageRoot, file);
    const prompts = loadJsonArray(filePath);

    for (const prompt of prompts) {
      totalImagePrompts += 1;
      const bucket = classifyImagePrompt(prompt, filePath);
      bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
      if (bucket === "anime") animeCount += 1;

      if (!prompt.tools || !prompt.tools.length) {
        warnings.push(`Prompt ${prompt.slug} in ${file} has no tools set.`);
      }

      const hasRef = hasReferencePlaceholder(prompt.template) || hasReferencePlaceholder(prompt.examplePrompt);
      if (hasRef && !prompt.tags.some((tag) => tag.toLowerCase().includes("reference"))) {
        warnings.push(`Prompt ${prompt.slug} in ${file} uses reference placeholders but lacks a reference-related tag.`);
      }
    }
  }

  if (!totalImagePrompts) {
    console.warn("No image prompts found.");
    return;
  }

  console.log("Image prompt distribution (actual vs target):");
  for (const [bucket, target] of Object.entries(IMAGE_BUCKET_TARGETS)) {
    const count = bucketCounts[bucket] || 0;
    const share = count / totalImagePrompts;
    console.log(`  - ${bucket}: ${(share * 100).toFixed(1)} % (target ${(target * 100).toFixed(1)} %) [${count}]`);
  }
  console.log(`Total image prompts: ${totalImagePrompts}`);

  const animeShare = animeCount / totalImagePrompts;
  const maxAnime = IMAGE_BUCKET_TARGETS["anime"];
  if (animeShare > maxAnime + 0.005) {
    errors.push(
      `Anime share too high: ${(animeShare * 100).toFixed(2)} % (max ${(maxAnime * 100).toFixed(2)} %). Reduce anime prompts or increase other buckets.`,
    );
  }

  if (warnings.length) {
    console.warn("
Warnings:");
    for (const w of warnings) console.warn(" -", w);
  }

  if (errors.length) {
    console.error("
Errors:");
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }
}

main();


const STRICT_REFERENCE_PLACEHOLDERS = ['[USER_PHOTO]','[FACE_REFERENCE]','[CHARACTER_REFERENCE]','[PRODUCT_REFERENCE]','[STYLE_REFERENCE]','[POSE_REFERENCE]','[COMPOSITION_REFERENCE]','[BRAND_REFERENCE]','[ENVIRONMENT_REFERENCE]'];
const STRICT_PLACEHOLDER_RE = /\[[A-Z_]{2,}\]/g;

function containsStrictPlaceholder(value: string): boolean {
  return STRICT_PLACEHOLDER_RE.test(value || '');
}

function enforceExamplePlaceholderRule(prompts: any[], scopeLabel: string) {
  let violations = 0;
  for (const prompt of prompts) {
    if (containsStrictPlaceholder(prompt.examplePrompt || '')) {
      violations += 1;
      console.error(`[FAIL] ${scopeLabel}: examplePrompt contains placeholders for ${prompt.id || prompt.slug || prompt.title}`);
    }
  }
  return violations;
}

function countReferenceAwareTemplates(prompts: any[]) {
  return prompts.filter((prompt) => STRICT_REFERENCE_PLACEHOLDERS.some((token) => (prompt.template || '').includes(token))).length;
}
