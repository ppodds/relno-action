export const macros = {
  toSentence: (str: string): string => {
    if (str.length === 0) return str;
    return str[0].toUpperCase() + str.substring(1);
  },
  toTitle: (str: string): string => {
    return str
      .split(" ")
      .map((s) => macros.toSentence(s))
      .join(" ");
  },
  generateIfNotEmpty: (toBeCheck: string, content: string): string =>
    toBeCheck.length > 0 ? content : "",
  generateIfEmpty: (toBeCheck: string, content: string): string =>
    toBeCheck.length === 0 ? content : "",
};
