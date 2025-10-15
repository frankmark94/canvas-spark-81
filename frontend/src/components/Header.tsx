import { Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">CanvasAI</span>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          Powered by <span className="text-foreground font-medium">OpenAI + AWS</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
