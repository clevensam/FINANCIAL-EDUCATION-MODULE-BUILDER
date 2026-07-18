import { BlockType, type Block, type BlockContent, type BlockSettings } from '@/types';
import { generateUUIDv4 } from './uuid';

const defaultSettings: BlockSettings = {
  isVisible: true,
  isLocked: false,
  customCss: '',
};

const defaultContents: Record<BlockType, BlockContent> = {
  [BlockType.RichText]: { html: '<p>Start typing here...</p>' },
  [BlockType.Image]: { src: '', alt: '', caption: '', alignment: 'full-width', isUpload: false },
  [BlockType.VideoEmbed]: { url: '', platform: null, videoId: '' },
  [BlockType.QuizMCQ]: {
    question: 'What is the 50-30-20 rule?',
    options: [
      {
        id: generateUUIDv4(),
        text: '50% needs, 30% wants, 20% savings',
        isCorrect: true,
        explanation: '',
      },
      {
        id: generateUUIDv4(),
        text: '50% savings, 30% needs, 20% wants',
        isCorrect: false,
        explanation: '',
      },
    ],
    points: 10,
    attemptLimit: 1,
    feedbackMode: 'immediate',
    timer: null,
    allowMultipleCorrect: false,
    partialCredit: false,
  },
  [BlockType.QuizTrueFalse]: {
    question: 'A budget helps you track your income and expenses.',
    correctAnswer: true,
    explanation: '',
    points: 10,
    attemptLimit: 1,
    feedbackMode: 'immediate',
    timer: null,
  },
  [BlockType.EMICalculator]: {
    principal: 500000,
    annualRate: 8.5,
    tenureMonths: 240,
  },
  [BlockType.SIPCalculator]: {
    monthlyInvestment: 5000,
    annualReturn: 12,
    durationYears: 10,
  },
  [BlockType.CompoundInterest]: {
    principal: 100000,
    annualRate: 8,
    timeYears: 5,
    compoundingFrequency: 'annually',
  },
  [BlockType.Callout]: {
    variant: 'info',
    icon: 'info',
    content: '<p>This is an important note for learners.</p>',
  },
  [BlockType.Divider]: {
    style: 'solid',
    spacing: 'normal',
  },
  [BlockType.Accordion]: {
    items: [
      {
        id: generateUUIDv4(),
        title: 'What is compound interest?',
        content: '<p>Compound interest is interest earned on interest.</p>',
      },
    ],
  },
  [BlockType.ProgressTracker]: {
    totalSteps: 5,
    currentStep: 1,
    steps: ['Introduction', 'Basics', 'Advanced', 'Quiz', 'Summary'],
    mode: 'linear',
  },
  [BlockType.AchievementBadge]: {
    icon: 'star',
    title: 'Module Completed',
    description: 'Complete all lessons in this module',
    isLocked: true,
    unlockCondition: 'Complete all lessons',
  },
  [BlockType.CodeSnippet]: {
    code: 'console.log("Hello, World!");',
    language: 'javascript',
    showLineNumbers: true,
  },
  [BlockType.ConceptExplainer]: {
    steps: [
      {
        id: generateUUIDv4(),
        title: 'What is a Budget?',
        description: 'A budget is a plan for your money.',
        visualIndicator: '1',
      },
      {
        id: generateUUIDv4(),
        title: 'Income & Expenses',
        description: 'Track what comes in and what goes out.',
        visualIndicator: '2',
      },
      {
        id: generateUUIDv4(),
        title: 'Saving & Investing',
        description: 'Put your money to work.',
        visualIndicator: '3',
      },
    ],
    autoPlay: false,
    autoPlayInterval: 5000,
  },
};

export function createBlock(type: BlockType, order: number): Block {
  const content = { ...defaultContents[type] };
  return {
    id: generateUUIDv4(),
    type,
    order,
    content: structuredClone(content),
    settings: { ...defaultSettings },
  };
}

export function createAllDefaultBlocks(): Block[] {
  return Object.values(BlockType).map((type, index) => createBlock(type, index));
}

export function getDefaultContent(type: BlockType): BlockContent {
  return structuredClone(defaultContents[type]);
}
