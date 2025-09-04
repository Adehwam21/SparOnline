export const formatBalance = (num: number): string => {
  if (typeof num !== "number") return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(3) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + "M";
  if (num >= 10_000) return (num / 1_000).toFixed() + "K";
  return num.toLocaleString();
};

export const formatEntryFee = (num: number): string => {
  if (typeof num !== "number") return "Free";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(3) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed() + "K";
  return num.toLocaleString();
};

export const formatPrizePool = (num: number): string => {
  if (typeof num !== "number") return "0";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed() + "K";
  return num.toLocaleString();
};

export const formatPlayerUsername = (str: string): string => {
  if (typeof str !== "string") return "";

  if (str.length > 5) {
    return str.slice(0, 4) + "...";
  }

  return str;
};
