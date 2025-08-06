import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// Simple Users table
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `user-${Date.now()}`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  address: text("address"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Simple Stores table
export const stores = sqliteTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `store-${Date.now()}`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  ownerId: text("owner_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Simple Ratings table
export const ratings = sqliteTable("ratings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `rating-${Date.now()}`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id),
  rating: integer("rating").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// Simple validation schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(20, "Name must be at least 20 characters")
    .max(60, "Name must be at most 60 characters"),
  email: z.string().email("Must follow standard email validation rules"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must include at least one uppercase letter and one special character"
    ),
  address: z.string().max(400, "Address must be at most 400 characters"),
  role: z.string().default("user"),
});

export const storeSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email("Must follow standard email validation rules"),
  address: z.string().min(1).max(400, "Address must be at most 400 characters"),
  ownerId: z.string(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password must be at most 16 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/,
      "Password must include at least one uppercase letter and one special character"
    ),
});

export const ratingSchema = z.object({
  userId: z.string(),
  storeId: z.string(),
  rating: z.number().min(1).max(5),
});

// Simple types
export type User = typeof users.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type StoreData = z.infer<typeof storeSchema>;
export type RatingData = z.infer<typeof ratingSchema>;
export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;
