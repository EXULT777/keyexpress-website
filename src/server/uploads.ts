import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sanitizeHtml from "sanitize-html";
import sharp from "sharp";
import { uploadsDir } from "./paths";

// Images the Admin uploads: the logo, Service photos and social preview images.
// They're stored in DATA_DIR/uploads and served by src/app/uploads/[file]/route.ts.

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export type UploadKind = "logo" | "service" | "social";

// Photos are resized to this width at most (and turned into WebP), so a big
// photo straight from a phone doesn't slow the site down.
const maxWidth: Record<UploadKind, number> = { logo: 800, service: 1600, social: 1200 };

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const NOT_AN_IMAGE = "Please choose a PNG, JPG, WebP or SVG image.";

type Detected = "png" | "jpg" | "webp" | "svg";

// What the file really is, from its first bytes rather than its name.
function detect(bytes: Uint8Array): Detected | null {
  const starts = (...values: number[]) => values.every((value, i) => bytes[i] === value);
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (starts(0xff, 0xd8, 0xff)) return "jpg";
  const ascii = (from: number, to: number) => Buffer.from(bytes.subarray(from, to)).toString("latin1");
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  const head = Buffer.from(bytes.subarray(0, 4096)).toString("utf8");
  if (!head.includes("\u0000") && /^(﻿)?\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*|<!DOCTYPE[^>]*>\s*)*<svg[\s>]/i.test(head)) {
    return "svg";
  }
  return null;
}

const SVG_TAGS = [
  "svg", "g", "defs", "symbol", "use", "title", "desc", "style",
  "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "textPath",
  "linearGradient", "radialGradient", "stop", "pattern", "clipPath", "mask", "filter",
  "feGaussianBlur", "feOffset", "feBlend", "feColorMatrix", "feFlood", "feComposite", "feMerge", "feMergeNode",
  "image", "a", "metadata",
];

// SVGs can carry scripts. Only drawing elements are kept, without event
// handlers, and links may only point inside the file (or be embedded images).
// The uploads route also serves SVGs with a Content-Security-Policy that blocks
// scripts, in case anything slips through.
function cleanSvg(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: SVG_TAGS,
    allowedAttributes: false,
    allowVulnerableTags: true,
    parser: { xmlMode: true },
    allowedSchemes: [],
    allowedSchemesByTag: { image: ["data"] },
    allowedSchemesAppliedToAttributes: ["href", "xlink:href", "src"],
    allowProtocolRelative: false,
    transformTags: {
      "*": (tagName, attribs) => ({
        tagName,
        attribs: Object.fromEntries(Object.entries(attribs).filter(([name]) => !/^on/i.test(name))),
      }),
    },
  });
}

export async function saveUpload(
  dataDir: string,
  file: { name: string; bytes: Uint8Array },
  kind: UploadKind,
): Promise<UploadResult> {
  if (file.bytes.byteLength > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "That file is too big. Please choose an image smaller than 2 MB." };
  }
  const type = detect(file.bytes);
  if (!type) return { ok: false, error: NOT_AN_IMAGE };
  if (type === "svg" && kind === "social") {
    return { ok: false, error: "Please choose a PNG, JPG or WebP picture. Social sites can't show SVGs." };
  }

  let data: Buffer;
  let extension: "svg" | "webp";
  if (type === "svg") {
    data = Buffer.from(cleanSvg(Buffer.from(file.bytes).toString("utf8")));
    extension = "svg";
  } else {
    try {
      data = await sharp(file.bytes)
        .rotate()
        .resize({ width: maxWidth[kind], withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      return { ok: false, error: "That picture couldn't be opened. Please try a different file." };
    }
    extension = "webp";
  }

  const name = `${kind}-${randomUUID()}.${extension}`;
  await mkdir(uploadsDir(dataDir), { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ uploadsDir(dataDir), name), data);
  return { ok: true, url: `/uploads/${name}` };
}

// Only names this module creates: no folders, no "..".
const SAFE_NAME = /^[a-z]+-[0-9a-f-]{36}\.(webp|svg)$/;

export async function readUpload(dataDir: string, name: string): Promise<{ data: Buffer; contentType: string } | null> {
  if (!SAFE_NAME.test(name)) return null;
  try {
    const data = await readFile(path.join(/*turbopackIgnore: true*/ uploadsDir(dataDir), name));
    return { data, contentType: name.endsWith(".svg") ? "image/svg+xml" : "image/webp" };
  } catch {
    return null;
  }
}

// Removes an uploaded file that's no longer used. Anything that isn't one of
// our uploads (like the default /logo.svg) is left alone.
export async function deleteUpload(dataDir: string, url: string | null | undefined): Promise<void> {
  const name = url?.replace(/^\/uploads\//, "");
  if (!name || !SAFE_NAME.test(name)) return;
  await unlink(path.join(/*turbopackIgnore: true*/ uploadsDir(dataDir), name)).catch(() => {});
}
