import { ClientState } from "./game-state";

export type UpdateResponse = {
  id: "update";
  gameState: ClientState;
};

export type RejectResponse = {
  id: "reject";
  reason: string;
  commandId: string;
};

export type Response = UpdateResponse | RejectResponse;
