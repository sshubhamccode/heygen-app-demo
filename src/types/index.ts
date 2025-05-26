export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface Voice {
  id: string;
  name: string;
  gender: string;
  language: string;
  previewUrl: string;
}

export interface VideoFile {
  id?: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
  outputUrl?: string;
  translatedText?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}