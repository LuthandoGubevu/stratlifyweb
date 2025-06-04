import { AuthGuard } from '@/components/AuthGuard';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { UserNav } from '@/components/dashboard/UserNav';
import { SidebarProvider } from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <SidebarNav />
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 text-xl font-headline font-semibold text-primary md:hidden">
                  <Image src="/Stratify-Logo.png" alt="Stratlify Logo" width={24} height={24} className="h-6 w-6" />
                  Stratlify
                </Link>
                <div className="flex-1 md:flex-none">
                  {/* Search or other header items can go here */}
                </div>
                <UserNav />
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-secondary/40 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
