import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './index.css';

export function App() {
  return (
    <Button variant="secondary">
      <Mail className="mr-2 h-4 w-4" /> Login with Email
    </Button>
  );
}
