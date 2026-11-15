import { cn } from "@/lib/cn";

const HEIGHTS = { normal: { px: 48, className: "h-12" }, large: { px: 64, className: "h-16" } };

// A plain <img>: the logo may be an SVG or an uploaded image of any shape, so it
// keeps a fixed height and its own width. next/image doesn't resize SVGs anyway.
export function Logo({
  src,
  name,
  className,
  size = "normal",
}: {
  src: string;
  name: string;
  className?: string;
  size?: keyof typeof HEIGHTS;
}) {
  const height = HEIGHTS[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      height={height.px}
      className={cn(height.className, "w-auto max-w-full object-contain object-left", className)}
    />
  );
}
