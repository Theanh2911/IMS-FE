"use client"

import * as React from "react"
import {  IconCamera,  IconChartBar,  IconDashboard,  IconFolder,  IconInnerShadowTop,  IconListDetails,  IconListCheck,  IconUsers,  IconReceipt,} from "@tabler/icons-react"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface UserData {
  name: string
  username: string
  avatar: string
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState<UserData>({
    name: "",
    username: "",
    avatar: "/avatars/shadcn.jpg",
  })

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserData({
        name: parsedUser.name || parsedUser.username,
        username: parsedUser.username,
        avatar: "/avatars/shadcn.jpg",
      })
    }
  }, [])

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Users",
        url: "/users",
        icon: IconUsers,
      },
            {        title: "Products",        url: "/products",        icon: IconFolder,      },      {        title: "Stocktaking",        url: "/stocktaking",        icon: IconListCheck,      },      {        title: "Suppliers",        url: "/suppliers",        icon: IconChartBar,      },
      {
        title: "Positions",
        url: "/positions",
        icon: IconChartBar,
      },
      {
        title: "Transactions",
        url: "/transactions",
        icon: IconReceipt,
      },
    ],
    navClouds: [
      {
        title: "Capture",
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <span>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">TheAnh Co. Ltd</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
