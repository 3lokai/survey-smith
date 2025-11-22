import { pgTable, uuid, text, integer, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    userIdIdx: index('session_userId_idx').on(table.userId),
  })
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('account_userId_idx').on(table.userId),
  })
);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Auth Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Survey Requests Table
export const surveyRequests = pgTable('survey_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  brandName: text('brand_name').notNull(),
  brandDescription: text('brand_description'),
  brandCategory: text('brand_category'),
  brandMarket: text('brand_market'),
  context: text('context').notNull(),
  goals: text('goals').notNull(),
  audience: text('audience').notNull(),
  questionCount: integer('question_count').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  createdAtIdx: index('idx_survey_requests_created_at').on(table.createdAt),
  userIdIdx: index('idx_survey_requests_user_id').on(table.userId),
}));

// Survey Questions Table
export const surveyQuestions = pgTable('survey_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  surveyRequestId: uuid('survey_request_id')
    .notNull()
    .references(() => surveyRequests.id, { onDelete: 'cascade' }),
  sectionId: text('section_id').notNull(),
  questionId: text('question_id').notNull(),
  text: text('text').notNull(),
  type: text('type').notNull(),
  options: jsonb('options'),
  config: jsonb('config'),
  rationale: text('rationale').notNull(),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  requestIdIdx: index('idx_survey_questions_request_id').on(table.surveyRequestId),
  orderIdx: index('idx_survey_questions_order').on(table.surveyRequestId, table.orderIndex),
  sectionIdx: index('idx_survey_questions_section').on(table.surveyRequestId, table.sectionId),
}));

// Relations
export const surveyRequestsRelations = relations(surveyRequests, ({ one, many }) => ({
  user: one(user, {
    fields: [surveyRequests.userId],
    references: [user.id],
  }),
  questions: many(surveyQuestions),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one }) => ({
  surveyRequest: one(surveyRequests, {
    fields: [surveyQuestions.surveyRequestId],
    references: [surveyRequests.id],
  }),
}));

// Type exports for type-safe inserts and selects
export type SurveyRequest = typeof surveyRequests.$inferSelect;
export type InsertSurveyRequest = typeof surveyRequests.$inferInsert;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type InsertSurveyQuestion = typeof surveyQuestions.$inferInsert;

