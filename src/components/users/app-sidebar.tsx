"use client"

import * as React from "react"
import {
  IconCamera,
  IconTags,
  IconDashboard,
  IconPackage,
  IconInnerShadowTop,
  IconUsers,
  IconTruck,
  IconReceipt,
} from "@tabler/icons-react"

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

const data = {
  user: {
    name: "Nguyễn Thế Anh",
    username: "Theanh291102",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Categories",
      url: "#",
      icon: IconTags,
    },
    {
      title: "Products",
      url: "#",
      icon: IconPackage,
    },
    {
      title: "Suppliers",
      url: "#",
      icon: IconTruck,
    },
    {
      title: "Transactions",
      url: "#",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <IconInnerShadowTop className="!size-5"/>
                <span className="text-base font-semibold">TheAnh Co. Ltd</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain}/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
