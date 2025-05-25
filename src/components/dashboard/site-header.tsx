"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard Overview'
      case '/users':
        return 'User Management'
      case '/categories':
        return 'Categories Management'
      case '/products':
        return 'Products Management'
      case '/suppliers':
        return 'Suppliers Management'
      case '/positions':
        return 'Positions Management'
      case '/transactions':
        return 'Transactions Management'
      case '/personal':
        return 'Personal Information'
      default:
        return 'Overview'
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link href="/personal" className="dark:text-foreground">
              Personal
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
