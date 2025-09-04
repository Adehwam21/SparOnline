interface QuickGameTable {
  name: string;
  variant: "race" | "survival";
  entryFee: number;
  maxPlayers: 2 | 3 | 4;
  maxPoints: 5 | 10;
}

export const tables: QuickGameTable[] = [
  { name: "New Russia", variant: "race", entryFee: 0, maxPlayers: 2, maxPoints: 5 },
  { name: "Tema", variant: "race", entryFee: 0, maxPlayers: 2, maxPoints: 10 },
  { name: "Tadi", variant: "race", entryFee: 50, maxPlayers: 2, maxPoints: 5 },
  { name: "Cape", variant: "race", entryFee: 50, maxPlayers: 3, maxPoints: 10 },
  { name: "Koftown", variant: "race", entryFee: 200, maxPlayers: 2, maxPoints: 5 },
  { name: "Ho", variant: "race", entryFee: 200, maxPlayers: 3, maxPoints: 10 },
  { name: "Dambai", variant: "race", entryFee: 1000, maxPlayers: 2, maxPoints: 5 },
  { name: "Sunyani", variant: "race", entryFee: 1000, maxPlayers: 3, maxPoints: 10 },
  { name: "Accra", variant: "race", entryFee: 5000, maxPlayers: 4, maxPoints: 10 },

  { name: "Bolga", variant: "survival", entryFee: 0, maxPlayers: 2, maxPoints: 5 },
  { name: "Nalerigu", variant: "survival", entryFee: 0, maxPlayers: 2, maxPoints: 10 },
  { name: "Damongo", variant: "survival", entryFee: 50, maxPlayers: 2, maxPoints: 5 },
  { name: "Goaso", variant: "survival", entryFee: 50, maxPlayers: 3, maxPoints: 10 },
  { name: "Techiman", variant: "survival", entryFee: 200, maxPlayers: 2, maxPoints: 5 },
  { name: "Sefwi", variant: "survival", entryFee: 200, maxPlayers: 3, maxPoints: 10 },
  { name: "Tamale", variant: "survival", entryFee: 1000, maxPlayers: 2, maxPoints: 5 },
  { name: "Wa", variant: "survival", entryFee: 1000, maxPlayers: 3, maxPoints: 10 },
  { name: "Kumasi", variant: "survival", entryFee: 5000, maxPlayers: 4, maxPoints: 10 },
];

export const quickGameTables: QuickGameTable[] = tables.sort(
  (a, b) => a.entryFee - b.entryFee
);
