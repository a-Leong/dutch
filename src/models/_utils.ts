import { _RefDatabase, _RefFirestore } from "vuefire";

export type DB<T> = _RefDatabase<T | undefined>;
export type FS<T> = _RefFirestore<T | undefined>;
