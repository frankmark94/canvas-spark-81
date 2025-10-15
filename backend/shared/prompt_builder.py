"""
Prompt Builder
Template-based prompt engineering for OpenAI API
"""

from typing import Optional, Dict, Any


class PromptBuilder:
    """Template-based prompt engineering"""

    # GPT-4 prompt template for UI intent extraction
    UI_EXTRACTION_TEMPLATE = """You are a UX/UI expert. Analyze the following user story and acceptance criteria,
then extract the key UI components and layout suggestions.

User Story:
{user_story}

Acceptance Criteria:
{criteria}

Provide a JSON response with:
1. "components": List of UI components needed (e.g., search bar, filter dropdown, product cards)
2. "layout": Suggested layout structure (e.g., header, sidebar, main content area)
3. "interactions": Key interaction patterns (e.g., hover effects, click actions, form validation)
4. "visual_style": Visual style recommendations (e.g., color scheme, typography, spacing)

Respond ONLY with valid JSON, no additional text."""

    # DALL-E 3 prompt template for image generation
    IMAGE_GENERATION_TEMPLATE = """Create a modern web application interface mockup with the following specifications:

UI Components: {components}
Layout: {layout}
Interaction Patterns: {interactions}

Style Requirements:
- Design system: Glassmorphism with soft gradients
- Color palette: Dark theme with blue (#4F7FFF) and purple (#7F4FFF) accents
- Typography: Clean sans-serif, clear hierarchy with size and weight
- Spacing: Generous padding, clear visual grouping
- Imagery: High-quality, contextual illustrations

Technical Specs:
- View: Desktop/web application
- Resolution: 1792x1024
- Format: Modern, minimalistic, professional

{refinement_context}

Ensure the design is:
- Visually balanced and harmonious
- Follows modern UI/UX best practices
- Accessible with good contrast ratios
- Production-ready in appearance"""

    @classmethod
    def extract_ui_components(cls, user_story: str, criteria: str) -> str:
        """
        Build prompt for UI component extraction

        Args:
            user_story: User story text
            criteria: Acceptance criteria text

        Returns:
            str: Formatted prompt for GPT-4
        """
        return cls.UI_EXTRACTION_TEMPLATE.format(
            user_story=user_story,
            criteria=criteria
        )

    @classmethod
    def build_image_prompt(cls,
                          components: str,
                          layout: str,
                          interactions: str,
                          refinement_notes: Optional[str] = None) -> str:
        """
        Build prompt for image generation

        Args:
            components: UI components list
            layout: Layout structure
            interactions: Interaction patterns
            refinement_notes: Optional refinement instructions

        Returns:
            str: Formatted prompt for DALL-E 3
        """
        refinement_context = ""
        if refinement_notes:
            refinement_context = f"\nAdditional Context/Refinements:\n{refinement_notes}"

        return cls.IMAGE_GENERATION_TEMPLATE.format(
            components=components,
            layout=layout,
            interactions=interactions,
            refinement_context=refinement_context
        )

    @classmethod
    def build_refinement_prompt(cls,
                                original_prompt: str,
                                refinement_notes: str) -> str:
        """
        Build prompt for design refinement

        Args:
            original_prompt: Original generation prompt
            refinement_notes: Refinement instructions

        Returns:
            str: Updated prompt incorporating refinements
        """
        return f"{original_prompt}\n\nREFINEMENTS:\n{refinement_notes}"
