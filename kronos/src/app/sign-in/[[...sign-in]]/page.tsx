import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
      
      <div className="relative z-10 w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]",
              card: "bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl",
              headerTitle: "text-white font-orbitron font-black uppercase tracking-tighter",
              headerSubtitle: "text-gray-400 font-mono text-xs uppercase tracking-widest",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl transition-all",
              socialButtonsBlockButtonText: "font-bold uppercase tracking-tight",
              formFieldLabel: "text-gray-400 font-mono text-[10px] uppercase tracking-widest",
              formFieldInput: "bg-black/50 border-white/10 text-white rounded-xl focus:border-primary/50 transition-all",
              footerActionLink: "text-primary hover:text-primary/80 font-bold",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-primary",
            }
          }}
        />
      </div>
    </div>
  );
}
