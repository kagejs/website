import { useCallback, useEffect, useRef, useState } from "preact/hooks";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const isClickScrolling = useRef(false);
  const clickTimeoutRef = useRef<number | null>(null);

  const handleClick = useCallback((e: MouseEvent, id: string) => {
    e.preventDefault();

    const element = document.getElementById(id);
    if (!element) return;

    setActiveId(id);
    isClickScrolling.current = true;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    history.pushState(null, "", `#${id}`);

    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    elements.forEach((el, index) => {
      const id = el.id || `heading-${index}`;
      if (!el.id) el.id = id;

      items.push({
        id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);

    const hash = window.location.hash.slice(1);
    if (hash && items.some((item) => item.id === hash)) {
      setActiveId(hash);
    } else if (items.length > 0) {
      setActiveId(items[0].id);
    }

    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + 100;
      let currentId = "";

      for (const item of items) {
        const element = document.getElementById(item.id);
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            currentId = item.id;
          }
        }
      }

      if (currentId && currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav class="space-y-1">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          onClick={(e) => handleClick(e as unknown as MouseEvent, heading.id)}
          class={`block text-xs py-1 font-light transition-colors duration-200 ${
            heading.level === 3 ? "pl-3" : ""
          } ${
            activeId === heading.id
              ? "text-emerald-400/80"
              : "text-white/25 hover:text-white/50"
          }`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
