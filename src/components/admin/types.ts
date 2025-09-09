export interface Tally {
  teamId: number;
  wins: number;
}

export interface Event {
  id: number;
  name: String;
  status: String;
  fightCount: number;
  tally: Tally[];
}

export interface Fight {
  id: number;
  eventId: number;
  fightNumber: number;
  aTeamId: number;
  bTeamId: number;
  winningSide: string;
  status: "open" | "started" | "cancelled" | "closed";
  result?: "LIYAMADO" | "DRAW" | "DEHADO";
}

export interface Team {
  id: number;
  name: String;
  owner: String;
}

