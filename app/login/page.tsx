import Image from "next/image";

import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <div className="grid w-full lg:grid-cols-[4fr_6fr]">
          <div className="hidden items-center justify-center bg-muted/40 p-10 lg:flex">
            <div className="relative">
              <div className="absolute -left-16 -top-12 h-56 w-56 rounded-full bg-primary/10" />
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
          <div className="relative flex h-full flex-col justify-center bg-primary p-10 lg:p-24 text-primary-foreground overflow-hidden">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border border-primary-foreground/15" />
            <div className="absolute -right-32 -bottom-24 h-72 w-72 rounded-full border border-primary-foreground/10" />
            <div className="relative z-10 w-full max-w-md mx-auto">
              <AuthPanel theme="dark" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
