import Image from "next/image";

type LogoProps = {
  width?: number;
  height?: number;
  logoOnly?: boolean; // Jika true, hanya tampilkan logo tanpa teks
};

export function Logo({ width = 28, height = 50, logoOnly = false }: LogoProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "GoGadget";
  return (
    <div className="flex justify-center items-center gap-2 text-2xl">
      <Image
        src="/logo.svg"
        alt={`${appName} Logo`}
        width={width}
        height={height}
      />
      {logoOnly ? null : <span className="font-semibold">{appName}</span>}
    </div>
  );
}
