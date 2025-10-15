export enum PromptStyle {
  DETAILED = 'Detailed',
  CREATIVE = 'Creative',
  TECHNICAL = 'Technical',
}

export interface HistoryItem {
  id: number;
  idea: string;
  style: PromptStyle;
  generatedPrompt: string;
}
