import Image from "next/image";

import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden items-center justify-center lg:flex">
            <div className="relative">
              <div className="absolute -left-20 -top-16 h-64 w-64 rounded-full bg-[#e3eefc]" />
              <Image
                src="/hero2.png"
                alt="Login illustration"
                width={520}
                height={520}
                className="relative z-10"
                priority
              />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[36px] bg-[#0f6fff] p-8 text-white shadow-2xl shadow-[#0f6fff]/30">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/30" />
            <div className="absolute -right-32 -bottom-24 h-72 w-72 rounded-full border border-white/20" />
            <div className="relative">
              <AuthPanel theme="light" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
