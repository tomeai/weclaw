"use client";

import { useUser } from "@/components/providers/user-provider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { List } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";


export function NaviMenu() {
    const pathname = usePathname()
    const {user, isJwtAuthenticated} = useUser()
    const isLoggedIn = !!user || isJwtAuthenticated
    const [open, setOpen] = useState(false)

    const linkClass =
        "font-base text-muted-foreground hover:text-foreground text-base transition-colors"
    const activeLinkClass =
        "font-base text-foreground text-base transition-colors border-b-2 border-foreground"
    const mobileLinkClass = "font-base text-foreground text-lg py-3 block"
    const mobileActiveLinkClass = "font-base text-foreground text-lg py-3 block border-b-2 border-foreground"

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/"
        }
        return pathname.startsWith(href)
    }

    return (
      <>
        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 text-xl font-medium md:flex">
          <Link
            href="/mcp"
            className={isActive("/mcp") ? activeLinkClass : linkClass}
          >
            MCP
          </Link>
          <Link
            href="/skills"
            className={isActive("/skills") ? activeLinkClass : linkClass}
          >
            Skill
          </Link>
          {/*<Link*/}
          {/*  href="/agent"*/}
          {/*  className={isActive("/agent") ? activeLinkClass : linkClass}*/}
          {/*>*/}
          {/*  Agent*/}
          {/*</Link>*/}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground p-2">
                <List size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] pt-12">
              <nav className="flex flex-col">
                <Link
                  href="/mcp"
                  className={
                    isActive("/mcp") ? mobileActiveLinkClass : mobileLinkClass
                  }
                  onClick={() => setOpen(false)}
                >
                  MCP
                </Link>
                <Link
                  href="/skills"
                  className={
                    isActive("/skills")
                      ? mobileActiveLinkClass
                      : mobileLinkClass
                  }
                  onClick={() => setOpen(false)}
                >
                  Skill
                </Link>
                {/*<Link*/}
                {/*  href="/agent"*/}
                {/*  className={*/}
                {/*    isActive("/agent") ? mobileActiveLinkClass : mobileLinkClass*/}
                {/*  }*/}
                {/*  onClick={() => setOpen(false)}*/}
                {/*>*/}
                {/*  Agent*/}
                {/*</Link>*/}
                {!isLoggedIn && (
                  <Link
                    href="/user/auth/login"
                    onClick={() => setOpen(false)}
                    className="font-base text-foreground hover:text-primary block py-3 text-left text-lg transition-colors"
                  >
                    登录
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </>
    )
}
