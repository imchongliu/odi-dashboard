/**
 * Footer Component
 * 
 * Design: Executive Clarity
 * - Minimal footer with essential information
 * - Subtle styling, doesn't compete with content
 */

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">ODI</span>
            </div>
            <span className="text-sm text-muted-foreground">
              China ODI Dashboard
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Data for demonstration purposes only</span>
            <span className="hidden md:inline">•</span>
            <span>© 2024 All rights reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
