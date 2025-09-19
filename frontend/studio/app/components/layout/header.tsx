"use client";

import {NaviMenu} from "@/app/components/layout/navi-menu";
import {useUser} from "@/app/providers/user-provider";
import Link from "next/link";
import {APP_NAME} from "../../lib/config"
import {useEffect, useState} from "react";
import { LoginModal } from "@/app/components/auth/login-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
    const {user, isJwtAuthenticated} = useUser()
    const isLoggedIn = !!user || isJwtAuthenticated
    const [isScrolled, setIsScrolled] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            setIsScrolled(scrollTop > 0)
            // Adjust glass effect based on scroll position
            const header = document.querySelector('header')
            if (header) {
                const opacity = Math.min(scrollTop / 100, 0.6)
                const blurAmount = Math.min(scrollTop / 5, 20)
                
                // Apply styles with smooth transitions
                header.style.backdropFilter = `blur(${blurAmount}px)`
                const isDark = document.documentElement.classList.contains('dark')
                const bgColor = isDark ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`
                header.style.backgroundColor = bgColor
                header.style.boxShadow = `0 2px 8px rgba(0, 0, 0, ${opacity * 0.2})`
                
                // Add class for when header is fully transparent
                if (scrollTop === 0) {
                    header.classList.add('header-transparent')
                } else {
                    header.classList.remove('header-transparent')
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

        return (
            <header className={`h-app-header fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
                isScrolled ? 'border-b border-border/80 backdrop-blur-xl bg-background/40 shadow-sm glass-effect' : 'header-transparent'
            }`}>
            <div
                className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:bg-transparent lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-medium tracking-tight">
                        {APP_NAME}
                    </Link>
                    <div className="hidden md:block">
                        <NaviMenu/>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {!isLoggedIn ? (
                        <>
                            <div className="hidden md:flex items-center gap-4">

                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="font-base text-muted-foreground hover:text-foreground text-base transition-colors"
                                >
                                    登录
                                </button>
                            </div>
                            <div className="md:hidden">
                                <NaviMenu/>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="md:hidden ml-4">
                                <NaviMenu/>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <LoginModal 
                open={showLoginModal} 
                onOpenChange={setShowLoginModal} 
            />
        </header>
    )
}
