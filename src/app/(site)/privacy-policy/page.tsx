import { PageHeader } from "@/components/site/site-chrome";
import { renderMarkdown } from "@/server/markdown";
import { pageMetadata } from "@/server/page-metadata";
import { getPlaceholderValues, getPolicy } from "@/server/site-data";

export function generateMetadata() {
  return pageMetadata("/privacy-policy");
}

export default async function PrivacyPolicyPage() {
  const [policy, values] = await Promise.all([getPolicy(), getPlaceholderValues()]);
  const lastUpdated = policy.lastUpdated.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });

  return (
    <>
      <PageHeader title="Privacy Policy">
        <p>Last updated: {lastUpdated}</p>
      </PageHeader>
      <div
        className="policy mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16"
        // renderMarkdown strips everything but plain formatting (see src/server/markdown.ts).
        dangerouslySetInnerHTML={{ __html: renderMarkdown(policy.markdown, values) }}
      />
    </>
  );
}
