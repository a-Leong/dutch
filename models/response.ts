import { ClientState } from "./game-state";

export type UpdateResponse = {
  id: "update";
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

export type Response = UpdateResponse | AllowResponse | RejectResponse;
