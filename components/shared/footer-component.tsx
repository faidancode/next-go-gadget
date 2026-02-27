import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const appName = process.env.APP_NAME || "GoGadget";

  const menuLinks = [
    { title: "Home", href: "/" },
    { title: "Shop", href: "/shop" },
    { title: "Categories", href: "/categories" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Brand Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" aria-label="go home" className="block w-fit">
              <div className="flex items-center gap-3">
                <div
                  className="bg-primary p-1.5 rounded-xl shadow-sm"
                >
                  <Image
                    src="/logo.svg"
                    alt={`${appName} Logo`}
                    width={24}
                    height={24}
                    className="brightness-0 invert"
                  />
                </div>
                <h1 className="font-serif italic text-2xl tracking-tighter text-slate-900">
                  {appName}
                </h1>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-slate-500 font-medium">
              Elevating your digital lifestyle. {appName} is a curated space to
              discover, explore, and collect the latest tech innovations that
              spark your imagination.
            </p>
          </div>

          {/* Navigation Section */}
          <div className="grid grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-5">
              <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Menu
              </span>
              <nav className="flex flex-col gap-3">
                {menuLinks.slice(0, 3).map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-[oklch(0.648_0.2_131.684)] transition-colors duration-200"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-5">
              <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Legal
              </span>
              <nav className="flex flex-col gap-3">
                {menuLinks.slice(3).map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-[oklch(0.648_0.2_131.684)] transition-colors duration-200"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-slate-50 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-[11px] font-mono tracking-wider uppercase">
            © {new Date().getFullYear()} —{" "}
            <span className="text-slate-900 font-bold">{appName}</span>{" "}
            Authorized Retailer
          </p>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              {/* Placeholder for Social Icons if needed */}
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors" />
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
