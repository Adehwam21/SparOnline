import { randomInt } from "crypto";
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

export function secureShuffleDeck(originalDeck: string[], passes = 3): string[] {
  let deck = [...originalDeck];

  for (let p = 0; p < passes; p++) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1); // Secure random index
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  return deck;
}



export function distributeCards(
  playerHands: PlayerHand[],
  deck: string[]
): PlayerHand[] {
  const n = playerHands.length;

  for (let i = 0; i < n; i++) {
    const first  = deck.slice(3 * i, 3 * i + 3);
    const second = deck.slice(3 * n + 2 * i, 3 * n + 2 * i + 2);
    playerHands[i].hand = [...first, ...second];
  }

  let spare = deck.slice(5 * n); // undealt cards

  for (const p of playerHands) {
    const suits = p.hand.map(getCardSuit);
    if (new Set(suits).size === 1 && spare.length) {
      const removeIdx = Math.floor(Math.random() * 5);
      const flushSuit = getCardSuit(p.hand[removeIdx]);

      const spareIdx = spare.findIndex(
        c => getCardSuit(c) !== flushSuit
      );
      if (spareIdx !== -1) {
        const replacement = spare[spareIdx];
        [p.hand[removeIdx], spare[spareIdx]] = [replacement, p.hand[removeIdx]];
      }
    }
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
  return ranks.find((r) => r.name === rank)?.points! || 0;
}

export function calculateRoundPoints(combo: IWinningCard[]): number {
  if (combo.length < 5) return 0;

  const third  = combo[2];
  const fourth = combo[3];
  const fifth  = combo[4];

  const isSamePlayer  = (...c: IWinningCard[]) =>
    c.every(x => x.playerName === c[0].playerName);

  const areSuitsUnique = (a: IWinningCard, b: IWinningCard, c?: IWinningCard) =>
    c
      ? new Set([a.suit, b.suit, c.suit]).size === 3
      : a.suit !== b.suit;

  const allBidFirst = (...c: IWinningCard[]) => c.every(x => x.bidIndex === 0);
  const allLowValue = (...c: IWinningCard[]) => c.every(x => x.value < 8);

  /*  Base case: just the value of the 5‑th trick’s winning card  */
  let points = fifth.point;

  const threeCardCombo =
    isSamePlayer(third, fourth, fifth) &&
    areSuitsUnique(third, fourth, fifth) &&
    allBidFirst(third, fourth, fifth) &&
    allLowValue(third, fourth, fifth);

  const twoCardCombo =
    isSamePlayer(fourth, fifth) &&
    areSuitsUnique(fourth, fifth) &&
    allBidFirst(fourth, fifth) &&
    allLowValue(fourth, fifth);

  if (threeCardCombo) {
    points = third.point + fourth.point + fifth.point;
  } else if (twoCardCombo) {
    points = fourth.point + fifth.point;
  }

  return points;       // always a number
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
