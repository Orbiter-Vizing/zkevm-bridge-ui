import { ZodSchema, ZodTypeDef } from "zod";

import { Exact } from "src/utils/types";

export const StrictSchema: <I, O = I>() => <UO, UI = UO>(
  u: Exact<ZodSchema<O, ZodTypeDef, I>, ZodSchema<UO, ZodTypeDef, UI>> extends true
    ? Exact<Required<O>, Required<UO>> extends true
      ? Exact<Required<I>, Required<UI>> extends true
        ? ZodSchema<UO, ZodTypeDef, UI>
        : never
      : never
    : never
) => ZodSchema<O, ZodTypeDef, I> =
  () =>
  <O, I = O>(u: unknown) =>
    u as ZodSchema<O, ZodTypeDef, I>;
