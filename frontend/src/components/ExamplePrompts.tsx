import { FileText, Shield, CreditCard, Settings } from "lucide-react";

interface ExamplePrompt {
  icon: React.ElementType;
  title: string;
  userStory: string;
  criteria: string[];
}

const examples: ExamplePrompt[] = [
  {
    icon: Shield,
    title: "Password Reset",
    userStory: "As a user, I want to reset my password so that I can regain access to my account if I forget it",
    criteria: [
      "User can request password reset via email",
      "Reset link expires after 24 hours",
      "Password must meet security requirements"
    ]
  },
  {
    icon: CreditCard,
    title: "Checkout Flow",
    userStory: "As a customer, I want to complete my purchase quickly so that I can receive my order",
    criteria: [
      "Show order summary with items and total",
      "Support multiple payment methods",
      "Display shipping options and delivery estimates"
    ]
  },
  {
    icon: Settings,
    title: "User Profile",
    userStory: "As a user, I want to edit my profile information so that my details stay up to date",
    criteria: [
      "Edit name, email, and profile picture",
      "Save changes with confirmation",
      "Display validation errors inline"
    ]
  }
];

interface ExamplePromptsProps {
  onSelectExample: (userStory: string, criteria: string) => void;
}

const ExamplePrompts = ({ onSelectExample }: ExamplePromptsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Example Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {examples.map((example, index) => {
          const Icon = example.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectExample(example.userStory, example.criteria.join("\n"))}
              className="glass rounded-xl p-4 text-left hover:bg-card/80 transition-all hover:shadow-glass group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">{example.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{example.userStory}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExamplePrompts;
