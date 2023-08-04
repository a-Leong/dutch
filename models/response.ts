import { ClientState } from "./game-state";

export type InitResponse = {
  id: "init";
  gameState: ClientState;
};

export type AllowResponse = {
  id: "allow" | "allow-something-else";
  commandSuccessful: true;
  gameState: ClientState;
  commandId: string;
};

export type RejectResponse = {
  id: "reject" | "reject-something-else";
  commandSuccessful: false;
  reason: "outOfTurn" | "ineligibleAction";
  commandId: string;
};

export type Response = InitResponse | AllowResponse | RejectResponse;
