import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthGuard } from "@/components/providers/auth-guard"
import { UserProvider } from "@/components/providers/user-provider"
import { Toaster } from "@/components/ui/sonner"
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ThemeProvider } from "next-themes"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider initialUser={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            <AuthGuard>{children}</AuthGuard>
            <GoogleAnalytics gaId="G-LP938NM4ZC" />
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
