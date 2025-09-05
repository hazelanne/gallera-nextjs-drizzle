export interface Fight {
  id: number;
  aSide: string;
  bSide: string;
  winningSide: string;
  status: "open" | "started" | "cancelled" | "closed";
  result?: "LIYAMADO" | "DRAW" | "DEHADO";
}
