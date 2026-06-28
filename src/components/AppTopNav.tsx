"use client";

import { cn } from "@/lib/utils";
import { Database } from "lucide-react";
import Image from "next/image";
import appIcon from "../assets/app-icon.png";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explorer", label: "Explorer" },
];

export function AppTopNav() {
  const pathname = usePathname();

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <div className="flex gap-4 h-16 items-center px-5 lg:px-6">
        <Link
          href="/dashboard"
          className="ml-4 flex items-center gap-8 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src={appIcon}
            alt="Bridge Risk Explorer"
            className="h-8 w-8 shrink scale-[2]"
            width={120}
            height={120}
          />

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              Bridge Risk Explorer
            </h1>

            <p className="mt-1 truncate text-xs text-muted-foreground">
              Identify, prioritize, and inspect bridges across the National Bridge Inventory.
            </p>
          </div>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="ml-auto flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-surface p-0.5"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-[var(--surface-selected)] text-foreground"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span className="hidden h-8 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-surface px-3 text-xs font-semibold text-foreground sm:inline-flex">
          <Database className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <p className="pt-0.5">National NBI</p>
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--condition-good-text)]"
            aria-label="Dataset available"
          />
        </span>
      </div>
    </header>
  );
}
