import React from "react";
import { DefaultImage } from "./default-image";

export default function SmallLogo() {
  return (
    <DefaultImage className="w-16 rounded" logoSize={28} logoOnly={true} />
  );
}
