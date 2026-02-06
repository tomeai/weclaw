"use client";

import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet"
import {List} from "@phosphor-icons/react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {useState} from "react"
import { AddMcpButton } from "@/components/mcp/add-mcp-button"
import { useUser } from "@/components/providers/user-provider"

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
                <Link href="/agent" className={isActive("/agent") ? activeLinkClass : linkClass}>
                    智能体
                </Link>
               {/*<Link href="/deepresearch" className={isActive("/deepresearch") ? activeLinkClass : linkClass}>*/}
               {/*     深度研究*/}
               {/* </Link>*/}
                <Link href="/rank" className={isActive("/rank") ? activeLinkClass : linkClass}>
                    排行榜
                </Link>
              <Link href="/news" className={isActive("/news") ? activeLinkClass : linkClass}>
                    动态
                </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground p-2">
                            <List size={24}/>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] pt-12">
                        <nav className="flex flex-col">
                            <Link
                                href="/agent"
                                className={isActive("/agent") ? mobileActiveLinkClass : mobileLinkClass}
                                onClick={() => setOpen(false)}
                            >
                                智能体
                            </Link>
                            <Link
                                href="/rank"
                                className={isActive("/rank") ? mobileActiveLinkClass : mobileLinkClass}
                                onClick={() => setOpen(false)}
                            >
                                排行榜
                            </Link>
                            <Link
                                href="/news"
                                className={isActive("/news") ? mobileActiveLinkClass : mobileLinkClass}
                                onClick={() => setOpen(false)}
                            >
                                动态
                            </Link>
                            <div className="py-2">
                                <AddMcpButton 
                                    onClick={!isLoggedIn ? () => {
                                        setOpen(false)
                                        window.location.href = '/user/auth/login'
                                    } : () => {
                                        setOpen(false)
                                        window.location.href = '/mcp/submit'
                                    }}
                                />
                            </div>
                            {!isLoggedIn && (
                                <Link
                                    href="/auth/login"
                                    onClick={() => setOpen(false)}
                                    className="font-base text-foreground text-lg py-3 block text-left hover:text-primary transition-colors"
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
