import SidebarNav from "../../islands/SidebarNav.tsx";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside class="w-56 shrink-0 border-r border-white/[0.04] h-[calc(100vh-64px)] sticky top-16 overflow-y-auto hidden lg:block">
      <SidebarNav currentPath={currentPath} />
    </aside>
  );
}
