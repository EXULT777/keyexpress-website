// Moving one item up or down a list kept in `sortOrder`. Returns every item's
// new position (0, 1, 2…), so gaps or duplicates from earlier edits disappear.
export function reorder(ids: number[], id: number, direction: "up" | "down"): { id: number; sortOrder: number }[] {
  const order = [...ids];
  const index = order.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index !== -1 && target >= 0 && target < order.length) {
    [order[index], order[target]] = [order[target], order[index]];
  }
  return order.map((itemId, position) => ({ id: itemId, sortOrder: position }));
}

// "European & Foreign Vehicles" -> "european-and-foreign-vehicles", made unique
// among `taken` by adding -2, -3…
export function uniqueSlug(title: string, taken: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "service";
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}
