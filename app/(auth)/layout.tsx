export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* 1. Background Decor - Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* 2. Ambient Glows (Emerald Theme) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* 3. Floating Shape Decor (Optional) */}
      <div className="absolute top-20 right-[15%] w-24 h-24 border border-emerald-200/20 rounded-3xl rotate-12 animate-pulse pointer-events-none hidden md:block" />
      <div className="absolute bottom-20 left-[15%] w-32 h-32 border border-emerald-200/20 rounded-[2rem] -rotate-12 animate-pulse pointer-events-none hidden md:block" />

      {/* 4. Content Wrapper */}
      <div className="relative z-10 w-full px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-500">
          {children}
        </div>
      </div>

      {/* 5. Footer Decor (Minimalist) */}
      <footer className="absolute bottom-6 w-full text-center pointer-events-none">
        <p className="text-[10px] font-black tracking-[0.2em] text-slate-300">
          GoGadget
        </p>
      </footer>
    </main>
  );
}
