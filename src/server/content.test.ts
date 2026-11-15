import { describe, expect, test } from "vitest";
import { getPageSections } from "./content";
import { starterSections } from "./starter-content";
import { createTestDatabase } from "./test-support/test-db";

describe("reading Page Sections", () => {
  test("a section saved before a field was added keeps its saved text and gets the starter text for the new field", async () => {
    const { db } = await createTestDatabase();
    // As saved by an older version of the site, before the hero had phoneIntro.
    await db.pageSection.update({
      where: { key: "home.hero" },
      data: {
        content: { heading: "Locked out? We're on our way.", text: "Fast help in {city}.", callButton: "Call", requestButton: "Ask" },
      },
    });

    const sections = await getPageSections(db);

    expect(sections["home.hero"].content).toEqual({
      heading: "Locked out? We're on our way.",
      text: "Fast help in {city}.",
      callButton: "Call",
      requestButton: "Ask",
      phoneIntro: starterSections["home.hero"].phoneIntro,
    });
  });
});
