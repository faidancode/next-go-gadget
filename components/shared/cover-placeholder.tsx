import { cn } from "@/lib/utils";

type CoverPlaceholderProps = {
  title: string;
  className?: string;
  fontSize?: string;
};

const digitPalette: Record<
  number,
  {
    bg: string;
    text: string;
  }
> = {
  0: { bg: "bg-blue-200", text: "text-blue-500" },
  1: { bg: "bg-red-300", text: "text-red-500" },
  2: { bg: "bg-emerald-200", text: "text-emerald-500" },
  3: { bg: "bg-violet-200", text: "text-violet-500" },
  4: { bg: "bg-orange-200", text: "text-orange-500" },
  5: { bg: "bg-rose-200", text: "text-rose-500" },
  6: { bg: "bg-amber-200", text: "text-amber-500" },
  7: { bg: "bg-teal-200", text: "text-teal-500" },
  8: { bg: "bg-indigo-200", text: "text-indigo-500" },
  9: { bg: "bg-lime-200", text: "text-lime-500" },
};

const defaultPalette = { bg: "bg-gray-200", text: "text-gray-700" };

function getPaletteFromTitle(title: string) {
  const matchedDigit = title.trim().match(/(\d)$/)?.[1];
  if (matchedDigit) {
    const digit = Number(matchedDigit);
    if (!Number.isNaN(digit) && digit in digitPalette) {
      return digitPalette[digit as keyof typeof digitPalette];
    }
  }
  return defaultPalette;
}

function splitTitleIntoLines(title: string, maxLines = 3) {
  const tokens = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return ["NA"];
  }

  if (tokens.length <= maxLines) {
    return tokens;
  }

  const lines = tokens.slice(0, maxLines - 1);
  lines.push(tokens.slice(maxLines - 1).join(" "));
  return lines;
}

export function CoverPlaceholder({ title, className, fontSize = "text-2xl" }: CoverPlaceholderProps) {
  const palette = getPaletteFromTitle(title);
  const lines = splitTitleIntoLines(title);

  return (
    <div
      aria-label={`Placeholder cover for ${title}`}
      className={cn(
        "flex aspect-2/3 w-full items-center justify-center rounded-lg border border-dashed border-black/5 font-semibold uppercase",
        fontSize,
        palette.bg,
        palette.text,
        className
      )}
    >
      <span className="flex flex-col items-center text-center leading-tight">
        {lines.map((line, idx) => (
          <span key={`${line}-${idx}`}>{line}</span>
        ))}
      </span>
    </div>
  );
}
