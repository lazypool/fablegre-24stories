export type Story = {
  id: string;
  title: string;
};

export type EnglishSegment = { text: string; word: string | null; isItalic: boolean };

export type StoryParagraph = {
  english: string;
  chinese: string;
  segments: EnglishSegment[];
};
