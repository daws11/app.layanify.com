import { z } from 'zod';
import { createTRPCRouter } from '@/server/trpc';
import { authRouter } from './auth';
import { whatsappRouter } from './whatsapp';
import { workflowRouter } from './workflow';
import { conversationRouter } from './conversation';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  whatsapp: whatsappRouter,
  workflow: workflowRouter,
  conversation: conversationRouter,
});

export type AppRouter = typeof appRouter;
