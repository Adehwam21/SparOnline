import { botNamesByDifficulty } from "./config";
import { IBotPlayResponse, Bot, Difficulty } from "./Bot";
import {
  getCardSuit,
  getCardRank,
  getCardValue,
} from "../utils/roomUtils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Variant = "race" | "survival";

interface BotStrategy {
  comboMode:      boolean;
  comboAbandoned: boolean;
  comboReason:    string;
}

// ─── Card helpers ─────────────────────────────────────────────────────────────

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

// ─── Round-level strategy ─────────────────────────────────────────────────────

/**
 * RACE MODE — first to maxPoints wins.
 *
 * The bot is building its own score. Winning rounds and chasing
 * combos gets it to maxPoints faster.
 *
 * Urgency triggers:
 *   - Opponent is 1–2 pts from maxPoints → must score fast, go aggressive
 *   - Bot is 1–2 pts from maxPoints      → play safe, one clean win closes it
 *   - Behind by >30% of maxPoints        → needs burst, chase combo
 *   - Ahead by >30% of maxPoints         → protect lead, play safe
 */
function raceStrategy(
  botHand:       string[],
  botScore:      number,
  opponentScore: number,
  maxPoints:     number,
  difficulty:    string
): BotStrategy {
  const opponentGap     = maxPoints - opponentScore; // how far opponent is from winning
  const botGap          = maxPoints - botScore;      // how far bot is from winning
  const scoreGap        = botScore - opponentScore;  // positive = bot ahead
  const threshold       = Math.max(2, Math.round(maxPoints * 0.3));

  const comboCount = botHand.filter(
    (c) => getCardRank(c) === "6" || getCardRank(c) === "7"
  ).length;

  let comboMode   = false;
  let comboReason = "";

  if (comboCount < 2) {
    comboReason = "not enough 6s/7s";

  } else if (opponentGap <= 2) {
    // Opponent about to win — must score as many points as possible NOW
    comboMode   = true;
    comboReason = `race: emergency — opponent needs only ${opponentGap} more pt(s)`;

  } else if (botGap <= 2) {
    // Bot about to win — don't risk a combo failing, just close it out
    comboMode   = false;
    comboReason = `race: nearly there — bot needs only ${botGap} more pt(s)`;

  } else if (scoreGap <= -threshold) {
    comboMode   = true;
    comboReason = `race: behind by ${Math.abs(scoreGap)} — aggressive`;

  } else if (scoreGap >= threshold) {
    comboMode   = false;
    comboReason = `race: ahead by ${scoreGap} — protecting lead`;

  } else if (comboCount >= 3) {
    comboMode   = true;
    comboReason = "race: close game + strong combo hand";

  } else {
    comboMode   = difficulty === "hard";
    comboReason = difficulty === "hard"
      ? "race: hard — calculated risk on 2-card combo"
      : "race: medium — too risky with 2 combo cards";
  }

  return { comboMode, comboAbandoned: false, comboReason };
}

/**
 * SURVIVAL MODE — last to reach 0 loses.
 *
 * Winning a round subtracts points FROM THE OPPONENT rather than
 * adding to the bot. The strategic goal is to drain the opponent to 0.
 *
 * This flips several things:
 *
 *   1. "Urgency" now means the OPPONENT IS LOW (close to 0) — a combo
 *      could finish them instantly. This is the most aggressive trigger.
 *
 *   2. "Danger" means THE BOT IS LOW (close to 0) — the bot MUST win
 *      rounds to survive, because losing means the opponent subtracts
 *      from the bot's score. Ironically, being in danger also means
 *      being aggressive — a combo win subtracts more from the opponent,
 *      keeping the bot alive longer.
 *
 *   3. "Safe" means BOTH scores are comfortable — the bot can afford
 *      to play conservatively because neither player is close to losing.
 *
 *   4. Combo value scales with opponent's REMAINING score:
 *      - Opponent at 4 pts: a 3-pt combo win finishes them. Huge.
 *      - Opponent at 20 pts: a 3-pt combo subtracts 3. Useful but not urgent.
 *      So combo aggressiveness increases as the opponent gets lower.
 */
function survivalStrategy(
  botHand:       string[],
  botScore:      number,
  opponentScore: number,
  maxPoints:     number,
  difficulty:    string
): BotStrategy {
  const threshold  = Math.max(2, Math.round(maxPoints * 0.3));

  // In survival the starting score IS maxPoints, and 0 is the floor.
  // "Low" means close to 0.
  const botIsLow      = botScore <= threshold;
  const opponentIsLow = opponentScore <= threshold;

  // How lethal would a combo be right now?
  // If opponent has fewer points than the max combo value (9),
  // a combo could end the game this round.
  const comboCouldFinish = opponentScore <= 9;

  const comboCount = botHand.filter(
    (c) => getCardRank(c) === "6" || getCardRank(c) === "7"
  ).length;

  let comboMode   = false;
  let comboReason = "";

  if (comboCount < 2) {
    comboReason = "not enough 6s/7s";

  } else if (opponentIsLow && comboCouldFinish) {
    // Opponent is low AND a combo could finish them — maximum aggression
    comboMode   = true;
    comboReason = `survival: opponent at ${opponentScore} — combo could end the game`;

  } else if (opponentIsLow) {
    // Opponent is low but combo won't finish them — still aggressive,
    // every point subtracted matters
    comboMode   = true;
    comboReason = `survival: opponent is low (${opponentScore}) — drain aggressively`;

  } else if (botIsLow) {
    // Bot is in danger — must win rounds to survive.
    // Go aggressive: a combo win subtracts more from opponent,
    // giving the bot more breathing room.
    comboMode   = true;
    comboReason = `survival: bot is low (${botScore}) — must win rounds to survive`;

  } else if (comboCount >= 3) {
    // Both scores comfortable, but bot has a strong combo hand — worth trying
    comboMode   = true;
    comboReason = "survival: comfortable + strong combo hand";

  } else {
    // Both safe, only 2 combo cards — hard takes the calculated risk, medium doesn't
    comboMode   = difficulty === "hard";
    comboReason = difficulty === "hard"
      ? "survival: hard — calculated risk on 2-card combo"
      : "survival: medium — scores comfortable, not worth 2-card combo risk";
  }

  return { comboMode, comboAbandoned: false, comboReason };
}

/**
 * Entry point for round-level strategy.
 * Branches on variant and delegates to the appropriate function.
 */
function decideBotStrategy(
  botHand:       string[],
  botScore:      number,
  opponentScore: number,
  maxPoints:     number,
  difficulty:    string,
  variant:       Variant
): BotStrategy {
  return variant === "survival"
    ? survivalStrategy(botHand, botScore, opponentScore, maxPoints, difficulty)
    : raceStrategy(botHand, botScore, opponentScore, maxPoints, difficulty);
}

/**
 * Re-check combo viability after each move.
 * Mode-agnostic — the physical requirements (2+ combo cards, 2+ moves left)
 * are the same regardless of variant.
 */
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

// ─── Card selection ───────────────────────────────────────────────────────────

// These are mode-agnostic — HOW to play a card doesn't change,
// only WHY (which is handled by the strategy above).

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

// ─── SparBot ──────────────────────────────────────────────────────────────────

export class SparBot extends Bot {
  name: string;

  private strategyCache = new Map<number, BotStrategy>();
  private readonly ALL_RANKS = ["6","7","8","9","10","J","Q","K"];

  constructor(difficulty: Difficulty) {
    super(difficulty);
    this.name = botNamesByDifficulty[difficulty];
  }

  override async playMove(gameState: any): Promise<IBotPlayResponse> {

    // ── 1. Extract context ──────────────────────────────────────────────────

    const botPlayer      = gameState.players["bot"];
    const hand: string[] = botPlayer.hand;

    const opponentId = Object.keys(gameState.players).find((id) => id !== "bot")!;
    const opponent   = gameState.players[opponentId];

    const botScore      = botPlayer.score ?? 0;
    const opponentScore = opponent.score  ?? 0;
    const maxPoints     = gameState.maxPoints ?? 20;
    const variant       = (gameState.variant ?? "race") as Variant;

    const currentRound       = gameState.rounds?.at(-1);
    const moveNumber: number = gameState.moveNumber;
    const isLastMove         = moveNumber === 4;

    const existingBids: any[] = currentRound?.moves?.[String(moveNumber)]?.bids ?? [];
    const isLeading           = existingBids.length === 0;

    // ── 2. Easy: just follow suit ───────────────────────────────────────────

    if (this.difficulty === "easy") {
      const leadSuit = existingBids[0]?.suit ?? null;
      const card     = hand.find((c) => !leadSuit || getCardSuit(c) === leadSuit) ?? hand[0];
      return { cardName: card };
    }

    // ── 3. Round-level strategy (cached per round, includes variant) ────────

    const roundNumber: number = currentRound?.roundNumber ?? 0;

    if (!this.strategyCache.has(roundNumber)) {
      this.strategyCache.set(
        roundNumber,
        decideBotStrategy(hand, botScore, opponentScore, maxPoints, this.difficulty, variant)
      );
    }

    const strategy = this.strategyCache.get(roundNumber)!;
    refreshComboViability(strategy, hand, moveNumber);

    // ── 4. Move context ─────────────────────────────────────────────────────

    const leadSuit: string | null  = existingBids[0]?.suit ?? null;
    const currentBestValue: number = existingBids.reduce(
      (best: number, bid: any) =>
        bid.suit === leadSuit && bid.value > best ? bid.value : best,
      0
    );

    const seenCards = this.difficulty === "hard"
      ? getSeenCardsThisRound(gameState)
      : [];

    // ── 5. Choose card ───────────────────────────────────────────────────────

    const card = this.difficulty === "medium"
      ? this.mediumChoose(hand, isLeading, isLastMove, leadSuit, currentBestValue, moveNumber, strategy)
      : this.hardChoose(hand, isLeading, isLastMove, leadSuit, currentBestValue, moveNumber, strategy, seenCards);

    return { cardName: card };
  }

  // ── Medium ────────────────────────────────────────────────────────────────

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

  // ── Hard ──────────────────────────────────────────────────────────────────

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