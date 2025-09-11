export type Event = {
  eventId: number;
  name: string;
};

export type Fight = {
  fightId: number;
  fightNumber: number;
  status: "open" | "started" | "closed" | "cancelled";
  tally: { DEHADO: number; LIYAMADO: number; DRAW: number };
  payout: { DEHADO: number; LIYAMADO: number; DRAW: number };
};
