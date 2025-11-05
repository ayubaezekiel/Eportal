export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto w-full bottom-0 left-0">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} University Portal. All rights
            reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a href="/help" className="hover:text-foreground transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
