import type { ParamsDictionary } from "express-serve-static-core";

export interface TodoParams extends ParamsDictionary {
    id: string;
}