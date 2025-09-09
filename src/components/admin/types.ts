export interface Event {
  id: number;
  name: String;
  status: String;
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

