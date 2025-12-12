import { useState } from "preact/hooks";
import { getSidebarNavigation } from "../data/toc.ts";

interface SidebarItem {
  title: string;
  href?: string;
  items?: SidebarItem[];
}

interface SidebarNavProps {
  currentPath: string;
}

const navigation: SidebarItem[] = getSidebarNavigation();

function isActiveSection(section: SidebarItem, currentPath: string): boolean {
  if (section.items) {
    return section.items.some((item) => item.href === currentPath);
  }
  return section.href === currentPath;
}

interface SectionProps {
  section: SidebarItem;
  currentPath: string;
}

function Section({ section, currentPath }: SectionProps) {
  const isActive = isActiveSection(section, currentPath);
  const [isOpen, setIsOpen] = useState(isActive);

  return (
    <div class="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        class="flex items-center justify-between w-full px-4 py-1.5 text-[10px] font-medium text-white/30 uppercase tracking-[0.15em] hover:text-white/50 transition-colors"
      >
        <span>{section.title}</span>
        <svg
          class={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {isOpen && section.items && (
        <ul class="mt-2 space-y-0.5">
          {section.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                class={`block px-4 py-1.5 text-sm font-light transition-colors ${
                  currentPath === item.href
                    ? "text-emerald-400/90 border-l border-emerald-500/50 bg-emerald-500/[0.03]"
                    : "text-white/40 hover:text-white/70 border-l border-transparent hover:border-white/10"
                }`}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SidebarNav({ currentPath }: SidebarNavProps) {
  return (
    <nav class="py-6">
      {navigation.map((section) => (
        <Section
          key={section.title}
          section={section}
          currentPath={currentPath}
        />
      ))}
    </nav>
  );
}
