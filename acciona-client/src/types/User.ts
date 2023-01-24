import { z } from "zod";

export const UserZ = z.object({
  account: z.object({
    city_id: z.number(),
    email: z.string(),
    free_seconds: z.number(),
    preferred_city: z.object({
      active: z.boolean(),
      country_id: z.number(),
      id: z.number(),
      slug: z.string(),
    }),
    promo_code: z.string(),
    region_id: z.number(),
    salesforce_id: z.string(),
    token: z.string(),
  }),
  benefits: z.object({
    courtesy_seconds: z.number(),
    free_seconds: z.number(),
    has_active_daily_pack_with_pause: z.boolean(),
    pack_seconds: z.number(),
  }),
  counters: z.object({
    co2: z.number(),
    kilometers: z.number(),
    minutes: z.number(),
    trips: z.number(),
  }),
  gamified: z.boolean(),
  inactive_reasons: z.array(z.unknown()),
  profile: z.object({
    address: z.string(),
    birthdate: z.string(),
    city: z.string(),
    commercial_communications: z.boolean(),
    country: z.number(),
    fiscal_code: z.string(),
    gender: z.string(),
    identification_number: z.string(),
    last_name: z.string(),
    name: z.string(),
    phone_number: z.string(),
    postal_code: z.string(),
    province: z.string(),
    readonly: z.boolean(),
    third_party_communications: z.boolean(),
  }),
  recurring_premium_insurance: z.boolean(),
  registration: z.object({
    completed_steps: z.number(),
    max_steps: z.number(),
  }),
});

export type User = z.infer<typeof UserZ>;
