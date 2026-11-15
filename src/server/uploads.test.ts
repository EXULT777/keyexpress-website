import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, test } from "vitest";
import { readUpload, saveUpload } from "./uploads";

const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function dataDir() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "keyexpress-uploads-"));
  dirs.push(dir);
  return dir;
}

function png(width: number, height: number) {
  return sharp({ create: { width, height, channels: 4, background: "#1e56c7" } }).png().toBuffer();
}

function nameOf(url: string) {
  return url.replace(/^\/uploads\//, "");
}

describe("uploading an image", () => {
  test("a PNG logo is stored and can be read back as an image", async () => {
    const dir = await dataDir();

    const result = await saveUpload(dir, await png(400, 100), "logo");

    if (!result.ok) throw new Error(result.error);
    expect(result.url).toMatch(/^\/uploads\/[a-z0-9-]+\.webp$/);
    const stored = await readUpload(dir, nameOf(result.url));
    expect(stored?.contentType).toBe("image/webp");
  });

  test("a file over 2 MB is refused", async () => {
    const dir = await dataDir();
    const big = Buffer.alloc(2 * 1024 * 1024 + 1);
    (await png(10, 10)).copy(big);

    const result = await saveUpload(dir, big, "service");

    expect(result).toEqual({ ok: false, error: "That file is too big. Please choose an image smaller than 2 MB." });
  });

  test("a file that isn't really a picture is refused", async () => {
    const dir = await dataDir();

    const result = await saveUpload(dir, Buffer.from("just some text"), "logo");

    expect(result).toEqual({ ok: false, error: "Please choose a PNG, JPG, WebP or SVG image." });
  });

  test("scripts, event handlers and javascript: links are removed from SVGs", async () => {
    const dir = await dataDir();
    const svg = `<?xml version="1.0"?>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)">
        <script>alert("hi")</script>
        <a href="javascript:alert(2)"><path d="M0 0h10v10z" fill="#0b2545" onclick="alert(3)"/></a>
      </svg>`;

    const result = await saveUpload(dir, Buffer.from(svg), "logo");

    if (!result.ok) throw new Error(result.error);
    const stored = await readUpload(dir, nameOf(result.url));
    const text = stored!.data.toString("utf8");
    expect(stored!.contentType).toBe("image/svg+xml");
    expect(text).toContain('viewBox="0 0 10 10"');
    expect(text).toContain('<path d="M0 0h10v10z" fill="#0b2545"');
    expect(text).not.toMatch(/script|onload|onclick|javascript:|alert/i);
  });

  test("an SVG can't be a sharing picture, because social sites don't show SVGs", async () => {
    const dir = await dataDir();
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';

    const result = await saveUpload(dir, Buffer.from(svg), "social");

    expect(result).toEqual({ ok: false, error: "Please choose a PNG, JPG or WebP picture. Social sites can't show SVGs." });
  });

  test("a very large photo is shrunk to at most 1600 pixels wide", async () => {
    const dir = await dataDir();

    const result = await saveUpload(dir, await png(3000, 2000), "service");

    if (!result.ok) throw new Error(result.error);
    const stored = await readUpload(dir, nameOf(result.url));
    const { width, height } = await sharp(stored!.data).metadata();
    expect([width, height]).toEqual([1600, 1067]);
  });

  test("a file name that tries to reach outside the uploads folder finds nothing", async () => {
    const dir = await dataDir();

    expect(await readUpload(dir, "../keyexpress.db")).toBeNull();
    expect(await readUpload(dir, "..%2Fkeyexpress.db")).toBeNull();
  });
});
