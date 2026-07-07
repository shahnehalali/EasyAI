export type FeedbackMountMode = 'floating' | 'sidebar' | 'navbar' | 'manual';

export interface FeedbackConfig {
  apiUrl: string;
  mode?: FeedbackMountMode;
  enabled?: boolean;
  buttonLabel?: string;
  floatingPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  withCredentials?: boolean;
  meta?: Record<string, string | number | boolean>;
  onSubmitSuccess?: () => void;
  onSubmitError?: (err: unknown) => void;
}

export interface FeedbackContextValue {
  config: Required<Pick<FeedbackConfig, 'apiUrl'>> & FeedbackConfig;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  isCapturing: boolean;
  /** Warm the lazy modal chunk ahead of the click (e.g. on hover). */
  prefetch: () => void;
}

export interface AnnotationLine {
  id: string;
  tool: 'pen' | 'highlight';
  color: string;
  strokeWidth: number;
  points: number[];
}

export interface AnnotationArrow {
  id: string;
  color: string;
  points: [number, number, number, number];
}

export interface AnnotationRect {
  id: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnnotationText {
  id: string;
  color: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export type AnnotationShape = AnnotationLine | AnnotationArrow | AnnotationRect | AnnotationText;
