import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/Sidebar"
import { ScrollToTop } from "@/components/ScrollToTop"
import { SearchCommand } from "@/components/SearchCommand"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"

export function RootLayout() {
  return (
    <SidebarProvider>
      <ScrollToTop />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background px-4">
          <SidebarTrigger />
          <span className="font-bold text-lg tracking-tight md:hidden">Devy</span>
          <div className="ml-auto">
            <SearchCommand />
          </div>
        </header>
        <main className="px-4 md:px-14 py-8">
          <Outlet />
        </main>
        <ScrollToTopButton />
      </SidebarInset>
    </SidebarProvider>
  )
}
