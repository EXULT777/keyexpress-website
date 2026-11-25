import { createElement } from "react";
import {
  Award,
  Building2,
  Car,
  CarFront,
  Clock,
  Cpu,
  DoorClosedLocked,
  House,
  KeyRound,
  KeySquare,
  LockKeyhole,
  LockKeyholeOpen,
  Power,
  RotateCcwKey,
  ShieldCheck,
  Smartphone,
  Store,
  Tag,
  ThumbsUp,
  Truck,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

// The icons the Admin can pick for a Service or a Why Choose Us badge. The key is
// what the database stores; the label is what the Admin sees in the list.
export const icons = {
  car: { label: "Car", Icon: Car },
  "car-front": { label: "Car (front view)", Icon: CarFront },
  key: { label: "Key", Icon: KeyRound },
  fob: { label: "Key fob or remote", Icon: Smartphone },
  chip: { label: "Chip", Icon: Cpu },
  ignition: { label: "Ignition or start button", Icon: Power },
  building: { label: "Apartment building", Icon: Building2 },
  home: { label: "House", Icon: House },
  door: { label: "Locked door", Icon: DoorClosedLocked },
  store: { label: "Shop", Icon: Store },
  lock: { label: "Lock", Icon: LockKeyhole },
  "lock-open": { label: "Open lock (lockout)", Icon: LockKeyholeOpen },
  "master-key": { label: "Master key", Icon: KeySquare },
  rekey: { label: "Key with an arrow (rekey)", Icon: RotateCcwKey },
  wrench: { label: "Wrench", Icon: Wrench },
  truck: { label: "Van", Icon: Truck },
  tag: { label: "Price tag", Icon: Tag },
  award: { label: "Award ribbon (experience)", Icon: Award },
  clock: { label: "Clock", Icon: Clock },
  shield: { label: "Shield with a check", Icon: ShieldCheck },
  "thumbs-up": { label: "Thumbs up", Icon: ThumbsUp },
} satisfies Record<string, { label: string; Icon: LucideIcon }>;

export type IconName = keyof typeof icons;

export const iconNames = Object.keys(icons) as IconName[];

export function isIconName(value: string): value is IconName {
  return Object.hasOwn(icons, value);
}

export function iconFor(name: string): LucideIcon {
  return isIconName(name) ? icons[name].Icon : KeyRound;
}

// Renders the icon stored under `name` (an unknown name shows a key).
export function NamedIcon({ name, ...props }: { name: string } & LucideProps) {
  return createElement(iconFor(name), props);
}
