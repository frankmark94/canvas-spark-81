import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import ExamplePrompts from "./ExamplePrompts";

interface InputPanelProps {
  onGenerate: (userStory: string, acceptanceCriteria: string) => void;
  isGenerating: boolean;
}

const InputPanel = ({ onGenerate, isGenerating }: InputPanelProps) => {
  const [userStory, setUserStory] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");

  const handleGenerate = () => {
    if (userStory.trim() && acceptanceCriteria.trim()) {
      onGenerate(userStory, acceptanceCriteria);
    }
  };

  const handleSelectExample = (story: string, criteria: string) => {
    setUserStory(story);
    setAcceptanceCriteria(criteria);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Generate Design</h2>
        <p className="text-muted-foreground text-sm">
          Describe your user story and acceptance criteria to generate a visual mockup
        </p>
      </div>

      <ExamplePrompts onSelectExample={handleSelectExample} />

      <div className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label htmlFor="user-story" className="text-sm font-medium">
            User Story
          </Label>
          <Textarea
            id="user-story"
            placeholder="As a [role], I want to [action] so that [benefit]..."
            value={userStory}
            onChange={(e) => setUserStory(e.target.value)}
            className="min-h-[120px] glass resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acceptance-criteria" className="text-sm font-medium">
            Acceptance Criteria
          </Label>
          <Textarea
            id="acceptance-criteria"
            placeholder="• Criterion 1&#10;• Criterion 2&#10;• Criterion 3..."
            value={acceptanceCriteria}
            onChange={(e) => setAcceptanceCriteria(e.target.value)}
            className="min-h-[160px] glass resize-none"
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!userStory.trim() || !acceptanceCriteria.trim() || isGenerating}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Mockup
          </>
        )}
      </Button>
    </div>
  );
};

export default InputPanel;
