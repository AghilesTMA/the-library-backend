const isString = (input: any): input is string => {
  return typeof input == "string";
};

export const toNum = (input: any): number | null => {
  if (isString(input)) return parseInt(input);
  return null;
};
