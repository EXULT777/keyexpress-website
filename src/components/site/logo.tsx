import { cn } from "@/lib/cn";

// A plain <img>: the logo may be an SVG or an uploaded image of any shape, so it
// keeps a fixed height and its own width. next/image doesn't resize SVGs anyway.
export function Logo({ src, name, className }: { src: string; name: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} height={48} className={cn("h-12 w-auto max-w-full object-contain object-left", className)} />
  );
}
