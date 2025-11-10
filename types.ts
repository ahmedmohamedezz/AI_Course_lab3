export enum AppMode {
  Image = 'image',
  Vision = 'vision',
  File = 'file',
  Agent = 'agent',
  FineTuned = 'finetuned',
}

export type ResultData = {
  type: 'image' | 'text' | 'error';
  content: string;
};

export type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};
