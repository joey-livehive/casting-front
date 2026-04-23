'use client';

import { createContext, useContext } from 'react';

export type Tone = 'casual' | 'formal';

const ToneContext = createContext<Tone>('casual');

export const ToneProvider = ToneContext.Provider;

export function useTone(): Tone {
  return useContext(ToneContext);
}
