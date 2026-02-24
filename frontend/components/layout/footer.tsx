"use client";

import Link from "next/link";


export default function Footer() {
  return (
    <footer className="border-border/50 border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main row */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-foreground text-sm font-semibold">
                WeMCP
              </span>
            </Link>
            <span className="text-muted-foreground hidden text-sm sm:inline">
              Build Agents that think and act
            </span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/opentomeai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
              </svg>
            </a>
            <a
              href="https://github.com/tomeai/wemcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-border/50 text-muted-foreground mt-6 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row">
          <p>&copy; {new Date().getFullYear()} WeMCP. All rights reserved.</p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
