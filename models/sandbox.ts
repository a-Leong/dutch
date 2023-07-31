import { DB, FS } from "@/models/_utils";

export type Sandbox = {
  count: number;
};

export type SandboxDB = DB<Sandbox>;
export type SandboxFS = FS<Sandbox>;
