export const Banks = {
  BAC: 'BAC',
  BNCR: 'BNCR',
} as const;

export type BanksType = typeof Banks[keyof typeof Banks];