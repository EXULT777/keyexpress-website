"use client";

import { useState } from "react";
import { iconNames, icons, NamedIcon } from "@/lib/icons";
import { inputBase } from "./form-parts";

// A plain dropdown of icon names, with the chosen icon shown beside it.
export function IconSelect({ id, name, label, defaultValue }: { id: string; name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-bold text-navy">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-silver-light text-action">
          <NamedIcon name={value} aria-hidden="true" className="size-8" />
        </span>
        <select id={id} name={name} value={value} onChange={(event) => setValue(event.target.value)} className={inputBase}>
          {iconNames.map((iconName) => (
            <option key={iconName} value={iconName}>
              {icons[iconName].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
