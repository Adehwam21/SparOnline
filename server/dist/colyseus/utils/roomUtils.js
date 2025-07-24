"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
exports.secureShuffleDeck = secureShuffleDeck;
exports.distributeCards = distributeCards;
exports.getCardSuit = getCardSuit;
exports.getCardRank = getCardRank;
exports.getCardValue = getCardValue;
exports.getCardPoints = getCardPoints;
exports.calculateRoundPoints = calculateRoundPoints;
exports.calculateMoveWinner = calculateMoveWinner;
exports.calculatePrizeDistribution = calculatePrizeDistribution;
const crypto_1 = require("crypto");
const GameState_1 = require("../schemas/GameState");
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
function createDeck() {
    return suits.flatMap((suit) => ranks.map((rank) => `${rank.name}${suit}`));
}
function secureShuffleDeck(originalDeck, passes = 3) {
    let deck = [...originalDeck];
    for (let p = 0; p < passes; p++) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = (0, crypto_1.randomInt)(0, i + 1); // Secure random index
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    return deck;
}
function distributeCards(playerHands, deck) {
    const n = playerHands.length;
    for (let i = 0; i < n; i++) {
        const first = deck.slice(3 * i, 3 * i + 3);
        const second = deck.slice(3 * n + 2 * i, 3 * n + 2 * i + 2);
        playerHands[i].hand = [...first, ...second];
    }
    let spare = deck.slice(5 * n); // undealt cards
    for (const p of playerHands) {
        const suits = p.hand.map(getCardSuit);
        if (new Set(suits).size === 1 && spare.length) {
            const removeIdx = Math.floor(Math.random() * 5);
            const flushSuit = getCardSuit(p.hand[removeIdx]);
            const spareIdx = spare.findIndex(c => getCardSuit(c) !== flushSuit);
            if (spareIdx !== -1) {
                const replacement = spare[spareIdx];
                [p.hand[removeIdx], spare[spareIdx]] = [replacement, p.hand[removeIdx]];
            }
        }
    }
    return playerHands;
}
function getCardSuit(cardName) {
    return cardName.slice(-1); // last character
}
function getCardRank(cardName) {
    return cardName.slice(0, -1); // everything except last character
}
function getCardValue(cardName) {
    var _a;
    const rank = getCardRank(cardName);
    return ((_a = ranks.find((r) => r.name === rank)) === null || _a === void 0 ? void 0 : _a.value) || 0;
}
function getCardPoints(cardName) {
    var _a;
    const rank = getCardRank(cardName);
    return ((_a = ranks.find((r) => r.name === rank)) === null || _a === void 0 ? void 0 : _a.points) || 0;
}
function calculateRoundPoints(combo) {
    if (combo.length < 5)
        return 0;
    const third = combo[2];
    const fourth = combo[3];
    const fifth = combo[4];
    const isSamePlayer = (...c) => c.every(x => x.playerName === c[0].playerName);
    const areSuitsUnique = (a, b, c) => c
        ? new Set([a.suit, b.suit, c.suit]).size === 3
        : a.suit !== b.suit;
    const allBidFirst = (...c) => c.every(x => x.bidIndex === 0);
    const allLowValue = (...c) => c.every(x => x.value < 8);
    /*  Base case: just the value of the 5‑th trick’s winning card  */
    let points = fifth.point;
    const threeCardCombo = isSamePlayer(third, fourth, fifth) &&
        areSuitsUnique(third, fourth, fifth) &&
        allBidFirst(third, fourth, fifth) &&
        allLowValue(third, fourth, fifth);
    const twoCardCombo = isSamePlayer(fourth, fifth) &&
        areSuitsUnique(fourth, fifth) &&
        allBidFirst(fourth, fifth) &&
        allLowValue(fourth, fifth);
    if (threeCardCombo) {
        points = third.point + fourth.point + fifth.point;
    }
    else if (twoCardCombo) {
        points = fourth.point + fifth.point;
    }
    return points; // always a number
}
function calculateMoveWinner(bids) {
    if (bids.length === 0)
        return null;
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
    };
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
                bidIndex: i
            };
        }
    }
    return {
        winningCard: maxCard,
        moveWinner: maxCard.playerName
    };
}
function calculatePrizeDistribution(players, prizePool) {
    const payouts = [];
    // No players or prize pool
    if (players.length === 0 || prizePool <= 0)
        return payouts;
    const sorted = [...players].sort((a, b) => b.score - a.score);
    // Assign ranks with ties considered
    const rankedGroups = [];
    let currentGroup = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].score === currentGroup[0].score) {
            currentGroup.push(sorted[i]);
        }
        else {
            rankedGroups.push(currentGroup);
            currentGroup = [sorted[i]];
        }
    }
    rankedGroups.push(currentGroup); // push the last group
    const totalPlayers = players.length;
    // Case: 2 players → winner takes all
    if (totalPlayers === 2) {
        const winner = rankedGroups[0];
        const amountPerWinner = Math.floor(prizePool / winner.length);
        for (const p of winner) {
            const payout = new GameState_1.Payouts();
            payout.userId = p.mongoId;
            payout.amount = amountPerWinner;
            payouts.push(payout);
        }
        return payouts;
    }
    // Case: 3 players → award 1st and 2nd only
    if (totalPlayers === 3) {
        const rankShares = [0.7, 0.2]; // no reward for 3rd
        let prizeIndex = 0;
        let currentRank = 1;
        for (const group of rankedGroups) {
            if (prizeIndex >= rankShares.length)
                break;
            const totalShare = rankShares.slice(prizeIndex, prizeIndex + group.length).reduce((a, b) => a + b, 0);
            const amountPerPlayer = Math.floor((totalShare * prizePool) / group.length);
            for (const p of group) {
                const payout = new GameState_1.Payouts();
                payout.userId = p.mongoId;
                payout.amount = amountPerPlayer;
                payouts.push(payout);
            }
            prizeIndex += group.length;
            currentRank += group.length;
        }
        return payouts;
    }
    // Case: 4 or more players → award top 3
    const rankShares = [0.7, 0.2, 0.1];
    let prizeIndex = 0;
    for (const group of rankedGroups) {
        if (prizeIndex >= rankShares.length)
            break;
        const totalShare = rankShares.slice(prizeIndex, prizeIndex + group.length).reduce((a, b) => a + b, 0);
        const amountPerPlayer = Math.floor((totalShare * prizePool) / group.length);
        for (const p of group) {
            const payout = new GameState_1.Payouts();
            payout.userId = p.mongoId;
            payout.amount = amountPerPlayer;
            payouts.push(payout);
        }
        prizeIndex += group.length;
    }
    return payouts;
}
