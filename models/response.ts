export type InitResponse = {
  id: "init";
  gameState: object;
};

export type AllowResponse = {
  id: "allow" | "allow-something-else";
  commandSuccessful: true;
  gameState: object;
  action: string;
};

export type RejectResponse = {
  id: "reject" | "reject-something-else";
  commandSuccessful: false;
  reason: "outOfTurn" | "ineligibleAction";
  action: string;
};

export type Response = InitResponse | AllowResponse | RejectResponse;
