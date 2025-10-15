import { useState } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import CanvasArea from "@/components/CanvasArea";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (userStory: string, acceptanceCriteria: string) => {
    setIsGenerating(true);
    
    // Simulate API call
    try {
      // In a real implementation, this would call the backend API
      // const response = await fetch('/api/generate', { ... });
      
      // Simulating delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated image (placeholder)
      setGeneratedImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop");
      
      toast({
        title: "Design generated!",
        description: "Your mockup is ready for review",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 h-screen">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="border-r border-border/50 bg-gradient-subtle">
            <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
          
          {/* Canvas Area */}
          <div className="bg-background/50">
            <CanvasArea isGenerating={isGenerating} generatedImage={generatedImage} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
