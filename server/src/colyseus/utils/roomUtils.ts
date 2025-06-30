import { IBids, IWinningCard } from "../../types/game";

interface PlayerHand {
  playerName: string;
  hand: string[];
}

const suits = ["H", "D", "C", "S"];
const ranks = [
  { name: "6", value: 6, points: 3 },
  { name: "7", value: 7, points: 2 },
  { name: "8", value: 8, points: 1 },
  { name: "9", value: 9, points: 1 },
  { name: "10", value: 10, points: 1 },
  { name: "J", value: 11, points: 1 },
  { name: "Q", value: 12, points: 1 },
  { name: "K", value: 13, points: 1 },
];

export function createDeck(): string[] {
  return suits.flatMap((suit) =>
    ranks.map((rank) => `${rank.name}${suit}`)
  );
}


export function shuffleDeck(deck: string[]): string[] {
  return deck.sort(() => Math.random() - 0.5);
}


export function distributeCards(playerHands: PlayerHand[], deck: string[]): PlayerHand[] {
  for (let i = 0; i < playerHands.length; i++) {
    const firstShare = deck.slice(3 * i, 3 * i + 3);
    const secondShare = deck.slice((3 * playerHands.length) + (i * 2), (3 * playerHands.length) + (i * 2) + 2);
    playerHands[i].hand = [...firstShare, ...secondShare];
  }
  return playerHands;
}

export function getCardSuit(cardName: string): string {
  return cardName.slice(-1); // last character
}

export function getCardRank(cardName: string): string {
  return cardName.slice(0, -1); // everything except last character
}

export function getCardValue(cardName: string): number {
  const rank = getCardRank(cardName);
  return ranks.find((r) => r.name === rank)?.value || 0;
}

export function getCardPoints(cardName: string): number {
  const rank = getCardRank(cardName);
  return ranks.find((r) => r.name === rank)?.points || 0;
}

export function calculateRoundPoints(comboList: IWinningCard[]): number {
  if (comboList.length < 5) return 0;

  const third = comboList[2];
  const fourth = comboList[3];
  const fifth = comboList[4];

  const isSamePlayer = (...cards: IWinningCard[]) => cards.every(c => c.playerName === cards[0].playerName);
  const areSuitsUnique = (a: IWinningCard, b: IWinningCard, c?: IWinningCard) => {
    if (!c) return a.suit !== b.suit;
    return new Set([a.suit, b.suit, c.suit]).size === 3;
  };
  const allBidFirst = (...cards: IWinningCard[]) => cards.every(c => c.bidIndex === 0);
  const allLowWeight = (...cards: IWinningCard[]) => cards.every(c => c.value < 8);

  let finalPoints = fifth.value;

  const threeCardCombo = isSamePlayer(third, fourth, fifth) &&areSuitsUnique(third, fourth, fifth) && allBidFirst(third, fourth, fifth) && allLowWeight(third, fourth, fifth);
  const twoCardCombo = isSamePlayer(fourth, fifth) && areSuitsUnique(fourth, fifth) && allBidFirst(fourth, fifth) && allLowWeight(fourth, fifth);

  if (threeCardCombo) {
    finalPoints = third.points + fourth.points + fifth.points;
  } else if (twoCardCombo) {
    finalPoints = fourth.points + fifth.points;
  }

  return finalPoints;
}


export function calculateMoveWinner(bids: IBids[]) {
  if (bids.length === 0) return null;

  const leadingCard = bids[0];
  const leadingSuit = getCardSuit(leadingCard.cardName);

  let maxCard = {
    cardName: leadingCard.cardName,
    playerName: leadingCard.playerName,
    suit: leadingSuit,
    value: getCardValue(leadingCard.cardName),
    rank: getCardRank(leadingCard.cardName),
    point: getCardPoints(leadingCard.cardName),
    bidIndex: 0
  }

  for (let i = 1; i < bids.length; i++) {
    const current = bids[i];
    const currentSuit = getCardSuit(current.cardName);
    const currentValue = getCardValue(current.cardName);
    const currentRank = getCardRank(current.cardName);
    const currentPoint = getCardPoints(current.cardName);

    if (currentSuit === leadingSuit && currentValue > maxCard.value) {
      maxCard = {
        cardName: current.cardName,
        playerName: current.playerName,
        suit: currentSuit,
        rank: currentRank,
        value: currentValue,
        point: currentPoint,
        bidIndex:i
      };
    }
  }

  return {
    winningCard: maxCard,
    moveWinner: maxCard.playerName
  };

}
