
export type ItemType = 'paper' | 'book' | 'map' | 'feather';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  type: ItemType;
}

export interface AIResponse {
  content: string;
  suggestedTitle?: string;
}
