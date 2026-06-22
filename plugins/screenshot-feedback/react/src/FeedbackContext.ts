import { createContext } from 'react';
import type { FeedbackContextValue } from './types';

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);
