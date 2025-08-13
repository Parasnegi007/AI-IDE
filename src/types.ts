export interface FileTree {
  [key: string]: FileTreeItem;
}

export interface FileTreeItem {
  type: 'file' | 'folder';
  children?: FileTree;
}

export interface FileContent {
  [filePath: string]: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CodeSuggestion {
  description: string;
  code: string;
  language: string;
}