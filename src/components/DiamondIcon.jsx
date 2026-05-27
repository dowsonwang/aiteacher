import { Gem } from "lucide-react";
import { cn } from "../lib/utils.js";

export default function DiamondIcon({ className }) {
  return <Gem className={cn("h-4 w-4 text-sky-500", className)} />;
}

