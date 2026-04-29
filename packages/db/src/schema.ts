import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  pgEnum,
  integer,
  customType,
} from "drizzle-orm/pg-core";

// pgvector column type — stores float arrays as '[x,y,z]' strings in postgres
const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    if (!value) return [];
    return value.slice(1, -1).split(",").map(Number);
  },
});

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
    embeddingJson: jsonb("embedding_json"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    aiProcessedAt: timestamp("ai_processed_at", { withTimezone: true }),
    aiError: text("ai_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("notes_user_id_idx").on(t.userId),
    createdAtIdx: index("notes_created_at_idx").on(t.createdAt),
    userCreatedIdx: index("notes_user_created_idx").on(t.userId, t.createdAt),
  })
);

export const noteChunks = pgTable(
  "note_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    noteIdIdx: index("note_chunks_note_id_idx").on(t.noteId),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type NoteChunk = typeof noteChunks.$inferSelect;
export type NewNoteChunk = typeof noteChunks.$inferInsert;
