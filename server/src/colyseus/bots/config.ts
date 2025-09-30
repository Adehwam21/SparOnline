export const botServerUrl = {
  easy: "http://localhost:8000/api/v1/bots/0",
  medium: "http://localhost:8000/api/v1/bots/1",
  hard: "http://localhost:8000/api/v1/bots/2",
};

export const getBotServerUrl = (difficulty: keyof typeof botServerUrl): string => {
  return botServerUrl[difficulty];
}
export const botNamesByDifficulty = {
  easy: "Jack",
  medium: "King",
  hard: "Ace",
};

