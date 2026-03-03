import { botNamesByDifficulty } from "./config";
import { IBotPlayResponse, Bot, Difficulty } from "./Bot";
import {
  getCardSuit,
  getCardRank,
  getCardValue,
} from "../utils/roomUtils";

// ─Types ───

interface BotStrategy {
  comboMode:      boolean;
  comboAbandoned: boolean;
  comboReason:    string;
}

// ─Helpers ─

function lowestOf(cards: string[]): string {
  return cards.reduce(
    (low, c) => getCardValue(c) < getCardValue(low) ? c : low,
    cards[0]
  );
}

function highestOf(cards: string[]): string {
  return cards.reduce(
    (hi, c) => getCardValue(c) > getCardValue(hi) ? c : hi,
    cards[0]
  );
}

function getSeenCardsThisRound(gameState: any): string[] {
  const round = gameState.rounds?.at(-1);
  if (!round?.moves) return [];

  const seen: string[] = [];
  for (const move of Object.values(round.moves) as any[]) {
    for (const bid of (move as any).bids ?? []) {
      if (bid.cardName) seen.push(bid.cardName);
    }
  }
  return seen;
}

function unseenHigherCount(
  cardName:  string,
  seenCards: string[],
  allRanks:  string[]
): number {
  const suit  = getCardSuit(cardName);
  const value = getCardValue(cardName);

  return allRanks
    .filter((r) => getCardValue(`${r}${suit}`) > value)
    .filter((r) => !seenCards.includes(`${r}${suit}`))
    .length;
}

// ─Round-level strategy 

/**
 * Decide the bot's plan once at the start of each round.
 *
 * ADAPTIVE logic — driven by proximity to maxPoints, not a fixed gap:
 *
 *   1. Opponent is 1–2 points from winning  → EMERGENCY: go all-in regardless
 *   2. Bot is 1–2 points from winning       → SAFE: don't risk, just win cleanly
 *   3. Bot is behind by >30% of maxPoints   → AGGRESSIVE: chase combo
 *   4. Bot is ahead by >30% of maxPoints    → CONSERVATIVE: protect lead
 *   5. Close game                           → NEUTRAL: combo only with strong hand
 *
 * Using proportions of maxPoints means the thresholds scale correctly
 * whether the target is 5, 20, or 50 points.
 */
function decideBotStrategy(
  botHand:       string[],
  botScore:      number,
  opponentScore: number,
  maxPoints:     number,
  difficulty:    string
): BotStrategy {
  const opponentPointsToWin = maxPoints - opponentScore;
  const botPointsToWin      = maxPoints - botScore;
  const scoreGap            = botScore - opponentScore; // positive = bot ahead
  const dangerThreshold     = Math.max(2, Math.round(maxPoints * 0.3));

  const comboCount = botHand.filter(
    (c) => getCardRank(c) === "6" || getCardRank(c) === "7"
  ).length;

  let comboMode   = false;
  let comboReason = "";

  if (comboCount < 2) {
    // Not enough combo cards regardless of situation
    comboReason = "not enough 6s/7s";

  } else if (opponentPointsToWin <= 2) {
    // Opponent is about to win — must chase maximum points NOW
    comboMode   = true;
    comboReason = `emergency — opponent needs only ${opponentPointsToWin} more point(s)`;

  } else if (botPointsToWin <= 2) {
    // Bot is about to win — play safe, don't risk a combo going wrong
    comboMode   = false;
    comboReason = `nearly won — bot needs only ${botPointsToWin} more point(s)`;

  } else if (scoreGap <= -dangerThreshold) {
    // Behind by a significant margin — needs burst points
    comboMode   = true;
    comboReason = `behind by ${Math.abs(scoreGap)} (threshold: ${dangerThreshold}) — aggressive`;

  } else if (scoreGap >= dangerThreshold) {
    // Comfortably ahead — protect the lead
    comboMode   = false;
    comboReason = `ahead by ${scoreGap} (threshold: ${dangerThreshold}) — protecting lead`;

  } else if (comboCount >= 3) {
    // Close game with a strong combo hand — worth the risk
    comboMode   = true;
    comboReason = "close game + strong combo hand (3+ cards)";

  } else {
    // Only 2 combo cards in a close game: hard bot risks it, medium doesn't
    comboMode   = difficulty === "hard";
    comboReason = difficulty === "hard"
      ? "hard — calculated risk on 2-card combo"
      : "medium — too risky with only 2 combo cards";
  }

  return { comboMode, comboAbandoned: false, comboReason };
}

function refreshComboViability(
  strategy:         BotStrategy,
  botHand:          string[],
  currentMoveIndex: number
): void {
  if (!strategy.comboMode || strategy.comboAbandoned) return;

  const movesLeft   = 4 - currentMoveIndex;
  const remaining67 = botHand.filter(
    (c) => getCardRank(c) === "6" || getCardRank(c) === "7"
  ).length;

  if (movesLeft < 2 || remaining67 < 2) {
    strategy.comboMode      = false;
    strategy.comboAbandoned = true;
  }
}

// ─Card selection ────

function followCard(
  hand:             string[],
  leadSuit:         string,
  currentBestValue: number,
  isLastMove:       boolean
): string {
  const suitCards = hand.filter((c) => getCardSuit(c) === leadSuit);

  if (suitCards.length > 0) {
    const winning = suitCards.filter((c) => getCardValue(c) > currentBestValue);
    if (winning.length > 0) {
      return isLastMove ? highestOf(winning) : lowestOf(winning);
    }
    return lowestOf(suitCards);
  }

  return lowestOf(hand);
}

function safestLeadCard(
  hand:      string[],
  seenCards: string[],
  allRanks:  string[]
): string {
  return hand.reduce((best, c) => {
    const scoreC    = getCardValue(c) * 3 - unseenHigherCount(c, seenCards, allRanks) * 2;
    const scoreBest = getCardValue(best) * 3 - unseenHigherCount(best, seenCards, allRanks) * 2;
    return scoreC > scoreBest ? c : best;
  }, hand[0]);
}

// ─SparBot ──

export class SparBot extends Bot {
  name: string;

  private strategyCache = new Map<number, BotStrategy>();
  private readonly ALL_RANKS = ["6","7","8","9","10","J","Q","K"];

  constructor(difficulty: Difficulty) {
    super(difficulty);
    this.name = botNamesByDifficulty[difficulty];
  }

  override async playMove(gameState: any): Promise<IBotPlayResponse> {

    // Extract context 

    const botPlayer      = gameState.players["bot"];
    const hand: string[] = botPlayer.hand;

    const opponentId = Object.keys(gameState.players).find((id) => id !== "bot")!;
    const opponent   = gameState.players[opponentId];

    const botScore      = botPlayer.score ?? 0;
    const opponentScore = opponent.score  ?? 0;
    const maxPoints     = gameState.maxPoints ?? 20;  // passed from SpGameRoom

    const currentRound       = gameState.rounds?.at(-1);
    const moveNumber: number = gameState.moveNumber;
    const isLastMove         = moveNumber === 4;

    const existingBids: any[] = currentRound?.moves?.[String(moveNumber)]?.bids ?? [];
    const isLeading           = existingBids.length === 0;

    // Easy: just follow suit 

    if (this.difficulty === "easy") {
      const leadSuit = existingBids[0]?.suit ?? null;
      const card     = hand.find((c) => !leadSuit || getCardSuit(c) === leadSuit) ?? hand[0];
      return { cardName: card };
    }

    // Round-level strategy (cached per round) 

    const roundNumber: number = currentRound?.roundNumber ?? 0;

    if (!this.strategyCache.has(roundNumber)) {
      this.strategyCache.set(
        roundNumber,
        decideBotStrategy(hand, botScore, opponentScore, maxPoints, this.difficulty)
      );
    }

    const strategy = this.strategyCache.get(roundNumber)!;
    refreshComboViability(strategy, hand, moveNumber);

    // 4. Move context 

    const leadSuit: string | null  = existingBids[0]?.suit ?? null;
    const currentBestValue: number = existingBids.reduce(
      (best: number, bid: any) =>
        bid.suit === leadSuit && bid.value > best ? bid.value : best,
      0
    );

    const seenCards = this.difficulty === "hard"
      ? getSeenCardsThisRound(gameState)
      : [];

    // 5. Choose card 

    const card = this.difficulty === "medium"
      ? this.mediumChoose(hand, isLeading, isLastMove, leadSuit, currentBestValue, moveNumber, strategy)
      : this.hardChoose(hand, isLeading, isLastMove, leadSuit, currentBestValue, moveNumber, strategy, seenCards);

    return { cardName: card };
  }

  // Medium 

  private mediumChoose(
    hand:             string[],
    isLeading:        boolean,
    isLastMove:       boolean,
    leadSuit:         string | null,
    currentBestValue: number,
    moveNumber:       number,
    strategy:         BotStrategy
  ): string {
    const combo67 = hand.filter((c) => getCardRank(c) === "6" || getCardRank(c) === "7");
    const others  = hand.filter((c) => getCardRank(c) !== "6" && getCardRank(c) !== "7");

    if (strategy.comboMode && !strategy.comboAbandoned) {
      if (moveNumber >= 3 && combo67.length > 0) {
        if (isLeading) return combo67[0];
        const suitedWinning = combo67.filter(
          (c) => getCardSuit(c) === leadSuit && getCardValue(c) > currentBestValue
        );
        if (suitedWinning.length > 0) return lowestOf(suitedWinning);
        return combo67[0];
      }
      const pool = others.length > 0 ? others : combo67;
      return isLeading
        ? lowestOf(pool)
        : followCard(pool, leadSuit!, currentBestValue, isLastMove);
    }

    if (isLeading) return lowestOf(hand);
    return followCard(hand, leadSuit!, currentBestValue, isLastMove);
  }

  // Hard ──

  private hardChoose(
    hand:             string[],
    isLeading:        boolean,
    isLastMove:       boolean,
    leadSuit:         string | null,
    currentBestValue: number,
    moveNumber:       number,
    strategy:         BotStrategy,
    seenCards:        string[]
  ): string {
    const combo67 = hand.filter((c) => getCardRank(c) === "6" || getCardRank(c) === "7");
    const others  = hand.filter((c) => getCardRank(c) !== "6" && getCardRank(c) !== "7");

    if (strategy.comboMode && !strategy.comboAbandoned) {
      if (moveNumber >= 3 && combo67.length > 0) {
        if (isLeading) {
          const safeCombo = combo67.filter(
            (c) => unseenHigherCount(c, seenCards, this.ALL_RANKS) === 0
          );
          if (safeCombo.length > 0) return safeCombo[0];
          return combo67.reduce((best, c) =>
            unseenHigherCount(c, seenCards, this.ALL_RANKS) <
            unseenHigherCount(best, seenCards, this.ALL_RANKS) ? c : best,
            combo67[0]
          );
        }
        const suitedWinning = combo67.filter(
          (c) => getCardSuit(c) === leadSuit && getCardValue(c) > currentBestValue
        );
        if (suitedWinning.length > 0) return lowestOf(suitedWinning);
        return combo67[0];
      }
      const pool = others.length > 0 ? others : combo67;
      return isLeading
        ? lowestOf(pool)
        : followCard(pool, leadSuit!, currentBestValue, isLastMove);
    }

    if (isLeading) {
      if (isLastMove) return safestLeadCard(hand, seenCards, this.ALL_RANKS);
      return lowestOf(hand);
    }
    return followCard(hand, leadSuit!, currentBestValue, isLastMove);
  }
}