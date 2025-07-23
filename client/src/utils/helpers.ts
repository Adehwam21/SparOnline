export const formatNumber = (num: number): string => {
  if (typeof num !== "number") return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + "M";
  // if (num >= 10_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
};
