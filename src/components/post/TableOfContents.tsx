import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Extract headings from markdown content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      // Generate ID from heading text (similar to rehype-slug)
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      items.push({ id, text, level });
    }

    setTocItems(items);
  }, [content]);

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = tocItems.map(item => 
        document.getElementById(item.id)
      ).filter(Boolean);

      const scrollPosition = window.scrollY + 100; // Offset for fixed header

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(tocItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
    
    // Collapse TOC on mobile after clicking
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  const minLevel = Math.min(...tocItems.map(item => item.level));

  return (
    <Card className={cn('transition-all', className)}>
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 transition-transform',
              isCollapsed ? '' : 'rotate-90'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent>
          <nav aria-label="Table of contents">
            <ul className="space-y-2">
              {tocItems.map((item) => {
                const indent = (item.level - minLevel) * 16;
                const isActive = activeId === item.id;
                
                return (
                  <li
                    key={item.id}
                    style={{ paddingLeft: `${indent}px` }}
                  >
                    <button
                      onClick={() => handleClick(item.id)}
                      className={cn(
                        'text-left w-full text-sm py-1.5 px-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent/50 text-accent-foreground font-medium',
                        item.level === 1 && 'font-semibold',
                        item.level === 2 && 'font-medium',
                        item.level > 2 && 'text-muted-foreground'
                      )}
                    >
                      {item.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </CardContent>
      )}
    </Card>
  );
}
