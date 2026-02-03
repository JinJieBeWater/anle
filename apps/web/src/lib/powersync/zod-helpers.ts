import { z } from "zod";

export const stringToDate = z.string().transform((val) => new Date(val));

export const nullableStringToDate = z
  .string()
  .nullable()
  .transform((val) => (val ? new Date(val) : null));

export const numberToBoolean = z
  .number()
  .nullable()
  .transform((val) => (val ?? 0) > 0);

export const numberToString = z.number().transform((val) => val.toString());

export const stringToJson = z.string().transform((val) => {
  const value1 = JSON.parse(val);
  const value = typeof value1 === "string" ? JSON.parse(value1) : value1;
  return value;
});
