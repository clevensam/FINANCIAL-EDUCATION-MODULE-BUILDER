export enum BlockType {
  RichText = 'rich-text',
  Image = 'image',
  VideoEmbed = 'video-embed',
  QuizMCQ = 'quiz-mcq',
  QuizTrueFalse = 'quiz-true-false',
  EMICalculator = 'emi-calculator',
  SIPCalculator = 'sip-calculator',
  CompoundInterest = 'compound-interest',
  Callout = 'callout',
  Divider = 'divider',
  Accordion = 'accordion',
  ProgressTracker = 'progress-tracker',
  AchievementBadge = 'achievement-badge',
  CodeSnippet = 'code-snippet',
  ConceptExplainer = 'concept-explainer',
}

export interface BlockSettings {
  isVisible: boolean;
  isLocked: boolean;
  customCss: string;
}

export interface RichTextContent {
  html: string;
}

export interface ImageContent {
  src: string;
  alt: string;
  caption: string;
  alignment: 'left' | 'center' | 'right' | 'full-width';
  isUpload: boolean;
}

export interface VideoEmbedContent {
  url: string;
  platform: 'youtube' | 'vimeo' | null;
  videoId: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizMCQContent {
  question: string;
  options: QuizOption[];
  points: number;
  attemptLimit: number;
  feedbackMode: 'immediate' | 'deferred';
  timer: number | null;
  allowMultipleCorrect: boolean;
  partialCredit: boolean;
}

export interface QuizTrueFalseContent {
  question: string;
  correctAnswer: boolean;
  explanation: string;
  points: number;
  attemptLimit: number;
  feedbackMode: 'immediate' | 'deferred';
  timer: number | null;
}

export interface EMICalculatorContent {
  principal: number;
  annualRate: number;
  tenureMonths: number;
}

export interface SIPCalculatorContent {
  monthlyInvestment: number;
  annualReturn: number;
  durationYears: number;
}

export interface CompoundInterestContent {
  principal: number;
  annualRate: number;
  timeYears: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'annually';
}

export type CalloutVariant = 'info' | 'warning' | 'tip' | 'important' | 'danger';

export interface CalloutContent {
  variant: CalloutVariant;
  icon: string;
  content: string;
}

export type DividerStyle = 'solid' | 'dashed' | 'dotted' | 'gradient';
export type DividerSpacing = 'compact' | 'normal' | 'spacious';

export interface DividerContent {
  style: DividerStyle;
  spacing: DividerSpacing;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface AccordionContent {
  items: AccordionItem[];
}

export interface ProgressTrackerContent {
  totalSteps: number;
  currentStep: number;
  steps: string[];
  mode: 'linear' | 'branching';
}

export interface AchievementBadgeContent {
  icon: string;
  title: string;
  description: string;
  isLocked: boolean;
  unlockCondition: string;
}

export interface CodeSnippetContent {
  code: string;
  language: 'javascript' | 'python' | 'json' | 'sql' | 'typescript' | 'bash' | 'html' | 'css';
  showLineNumbers: boolean;
}

export interface ConceptExplainerStep {
  id: string;
  title: string;
  description: string;
  visualIndicator: string;
}

export interface ConceptExplainerContent {
  steps: ConceptExplainerStep[];
  autoPlay: boolean;
  autoPlayInterval: number;
}

export type BlockContent =
  | RichTextContent
  | ImageContent
  | VideoEmbedContent
  | QuizMCQContent
  | QuizTrueFalseContent
  | EMICalculatorContent
  | SIPCalculatorContent
  | CompoundInterestContent
  | CalloutContent
  | DividerContent
  | AccordionContent
  | ProgressTrackerContent
  | AchievementBadgeContent
  | CodeSnippetContent
  | ConceptExplainerContent;

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  content: BlockContent;
  settings: BlockSettings;
}
