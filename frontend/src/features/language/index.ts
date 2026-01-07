export const useLanguageContext = () => {
  return {
    language: "en",
    t: (key: string) => key,
  };
};
