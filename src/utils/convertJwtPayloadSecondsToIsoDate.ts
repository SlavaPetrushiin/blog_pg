export const convertJwtPayloadSecondsToIsoDate = (value: number): string => {
  return new Date(value * 1000).toISOString();
};
