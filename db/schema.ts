import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const events=sqliteTable('events',{id:text('id').primaryKey(),data:text('data').notNull(),updatedAt:text('updated_at').notNull()});
export const preferences=sqliteTable('preferences',{userId:text('user_id').primaryKey(),email:text('email').notNull(),data:text('data').notNull(),calendarToken:text('calendar_token').notNull().unique(),updatedAt:text('updated_at').notNull()});
export const deliveries=sqliteTable('deliveries',{id:text('id').primaryKey(),userId:text('user_id').notNull(),eventId:text('event_id').notNull(),sentAt:text('sent_at').notNull()});
export const submissions=sqliteTable('submissions',{id:text('id').primaryKey(),userId:text('user_id').notNull(),url:text('url').notNull(),createdAt:text('created_at').notNull(),reviewed:integer('reviewed').notNull().default(0)});
