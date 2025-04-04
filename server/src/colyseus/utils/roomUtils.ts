const suits = ["H", "D", "C", "S"];
const ranks = [
  { name: "6", value: 6 },
  { name: "7", value: 7 },
  { name: "8", value: 8 },
  { name: "9", value: 9 },
  { name: "10", value: 10 },
  { name: "J", value: 11 },
  { name: "Q", value: 12 },
  { name: "K", value: 13 },
];

export function createDeck(): string[] {
  return suits.flatMap((suit) =>
    ranks.map((rank) => `${rank.name}${suit}`)
  );
}


export function shuffleDeck(deck: string[]): string[] {
  return deck.sort(() => Math.random() - 0.5);
}


export function distributeCards(players: Object[]) {
  return
}


export function getCardValue(cardName: string): number {
  const rank = cardName[0];
  return ranks.find((r) => r.name === rank)?.value || 0;
}

export function calculateMoveWinner(moves: Object[]): string {
  return ""
}

export function calculateRoundPoints(round: any): number {
  return 10; // Example: Fixed 10 points per round win
}
