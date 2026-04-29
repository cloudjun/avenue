import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const urlFetchStatusEnum = pgEnum("url_fetch_status", [
  "none",
  "pending",
  "done",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title"),
    content: text("content").notNull(),
    sourceUrl: text("source_url"),
    urlTitle: text("url_title"),
    urlContent: text("url_content"),
    urlFetchStatus: urlFetchStatusEnum("url_fetch_status").default("none").notNull(),
    // Reserved for AI enrichment (AVE-4): embedding stored as JSONB float array
    // until pgvector is available; swap to vector(1536) column in next migration.
    embeddingJson: jsonb("embedding_json"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("notes_user_id_idx").on(t.userId),
    createdAtIdx: index("notes_created_at_idx").on(t.createdAt),
    userCreatedIdx: index("notes_user_created_idx").on(t.userId, t.createdAt),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
