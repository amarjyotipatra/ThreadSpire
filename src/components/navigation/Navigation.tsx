"use client";

import { UserButton } from "@clerk/nextjs";
import { HomeIcon, PlusSquare, BookmarkIcon, LineChart, SectionIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ui/ThemeToggle";

const Navigation = () => {
  const pathname = usePathname();
  
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: HomeIcon,
    },
    {
      label: "Create",
      href: "/create",
      icon: PlusSquare,
    },
    {
      label: "Bookmarks",
      href: "/bookmarks",
      icon: BookmarkIcon,
    },
    {
      label: "Collections",
      href: "/collections",
      icon: SectionIcon,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: LineChart,
    },
  ];
  
  return (
    <div className="w-64 border-r h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="text-2xl font-bold">ThreadSpire</div>
      </div>
      
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto border-t pt-4 flex flex-col gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-4 px-2">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm">Account</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;