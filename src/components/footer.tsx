import { Button } from '@/components/ui/button';

export const Footer = () => (
  <footer className="absolute bottom-2 w-full text-center text-sm text-muted-foreground">
    © {new Date().getFullYear()} By{' '}
    <Button variant="link" className="p-0" asChild>
      <a href="https://michalskolak.vercel.app/">Michał Skolak</a>
    </Button>
  </footer>
);
