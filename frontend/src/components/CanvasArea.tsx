import { Loader2, Image as ImageIcon } from "lucide-react";

interface CanvasAreaProps {
  isGenerating: boolean;
  generatedImage: string | null;
}

const CanvasArea = ({ isGenerating, generatedImage }: CanvasAreaProps) => {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Canvas</h2>
        <p className="text-sm text-muted-foreground">Your generated design will appear here</p>
      </div>

      <div className="flex-1 glass rounded-2xl overflow-hidden flex items-center justify-center relative">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium mb-1">Generating your design</p>
              <p className="text-sm text-muted-foreground">This may take a few moments...</p>
            </div>
          </div>
        ) : generatedImage ? (
          <div className="w-full h-full p-4 animate-fade-in">
            <img
              src={generatedImage}
              alt="Generated mockup"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="font-medium mb-1">No design yet</p>
              <p className="text-sm">Fill in the form and click Generate to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasArea;
