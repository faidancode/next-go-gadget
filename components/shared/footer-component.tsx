import Image from "next/image";
import Link from "next/link";

const menuLinks = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Shop",
    href: "/shop",
  },
  {
    title: "Categories",
    href: "/categories",
  },
];

const appName = process.env.APP_NAME || "GoGadget";

export function Footer() {
  return (
    <footer className="bg-tertiary border-t border-b border-secondary/30 pt-12 mt-4 dark:bg-transparent hidden lg:block">
      <div className="grid px-4 gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Link href="/" aria-label="go home" className="block size-fit">
            <div className="flex items-center gap-2 hover:cursor-pointer">
              <Image
                src="/logo.svg"
                alt={`${appName} Logo`}
                width={28}
                height={50}
              />
              <h1 className="font-bold text-xl md:text-2xl">{appName}</h1>
            </div>
          </Link>
          <p className="max-w-sm text-sm text-gray-400">
            {appName} is your curated space to discover, explore, and collect the
            books that spark your imagination.
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <span className="block font-semibold text-white text-lg">Menu</span>
          {menuLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-gray-400 hover:text-secondary block duration-150"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-4 bg-background mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-secondary/30 py-4">
        <p className="text-muted-foreground order-last block text-center text-sm md:order-first">
          {new Date().getFullYear()}{" "}
          <span className="text-secondary">GoGadget</span>, All rights reserved
        </p>
      </div>
    </footer>
  );
}
