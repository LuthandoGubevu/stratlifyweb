
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import {
  LayoutDashboard,
  Lightbulb,
  Heart,
  Gift,
  Users,
  Tags,
  Map,
  PenSquare,
  MousePointerClick,
  Repeat,
  Sparkles,
  Send,
  BarChart,
  Settings,
  Loader2,
  LogOut 
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Strategy Hub',
    isGroup: true,
    items: [
      { href: '/dashboard/idea-tracker', label: 'Idea Tracker', icon: Lightbulb },
      { href: '/dashboard/mass-desires', label: 'Mass Desires', icon: Heart },
      { href: '/dashboard/features-to-benefits', label: 'Features to Benefits', icon: Gift },
      { href: '/dashboard/customer-avatars', label: 'Customer Avatars', icon: Users },
    ],
  },
  {
    label: 'Campaign Tools',
    isGroup: true,
    items: [
      { href: '/dashboard/master-fields', label: 'Master Fields', icon: Tags },
      { href: '/dashboard/creative-roadmap', label: 'Creative Roadmap', icon: Map },
      { href: '/dashboard/headline-patterns', label: 'Headline Patterns', icon: PenSquare },
      { href: '/dashboard/ad-creation', label: 'Ad Creation', icon: MousePointerClick },
      { href: '/dashboard/iteration-tracker', label: 'Iteration Tracker', icon: Repeat },
      { href: '/dashboard/mechanization', label: 'Mechanization', icon: Sparkles },
      { href: '/dashboard/submissions', label: 'Submissions', icon: Send },
    ],
  },
  {
    label: 'Analysis & Settings',
    isGroup: true,
    items: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
      { href: '/dashboard/profile', label: 'Profile & Settings', icon: Settings },
    ],
  }
];

export function SidebarNav() {
  const pathname = usePathname();
  const { loading: authLoading, signOut, user } = useAuth(); 
  const router = useRouter(); 

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); 
  };

  const renderNavItem = (item: any, index: number) => (
    <SidebarMenuItem key={item.href || `item-${index}`}>
      <Link href={item.href} passHref legacyBehavior>
        <SidebarMenuButton
          isActive={pathname === item.href}
          tooltip={item.label}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2 flex justify-center items-center group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-0">
        <Link href="/dashboard" className="flex items-center gap-2 w-full justify-start group-data-[collapsible=icon]:justify-center">
          <Image src="/Stratify-Logo.png" alt="Stratify Logo" width={32} height={32} className="h-8 w-8" />
          <span className="font-headline text-xl font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">
            Stratlify
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item, index) => {
            if (item.isGroup) {
              return (
                <SidebarGroup key={`group-${index}`}>
                  <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
                  {item.items?.map(renderNavItem)}
                  {index < navItems.length -1 && !navItems[index+1].isGroup && <SidebarSeparator className="my-2" />}
                </SidebarGroup>
              );
            }
            return renderNavItem(item, index);
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {authLoading && (
          <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
        {user && !authLoading && (
           <SidebarMenuItem>
             <SidebarMenuButton onClick={handleSignOut} tooltip="Log Out" className="w-full">
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </SidebarMenuButton>
           </SidebarMenuItem>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
