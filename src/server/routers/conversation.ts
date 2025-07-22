import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { Conversation, Message, WhatsAppNumber } from '@/lib/models';
import { TRPCError } from '@trpc/server';

export const conversationRouter = createTRPCRouter({
  getConversations: protectedProcedure
    .input(z.object({
      whatsappNumberId: z.string().optional(),
      status: z.enum(['active', 'expired', 'opted-out']).optional(),
      limit: z.number().min(1).max(100).default(20),
      skip: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { whatsappNumberId, status, limit, skip } = input;

      const filter: any = { userId: ctx.user._id };
      if (whatsappNumberId) {
        filter.whatsappNumberId = whatsappNumberId;
      }
      if (status) {
        filter.status = status;
      }

      const conversations = await Conversation.find(filter)
        .populate('whatsappNumberId', 'number displayName')
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      // Get last message for each conversation
      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conv) => {
          const lastMessage = await Message.findOne({ 
            conversationId: conv._id 
          })
            .sort({ timestamp: -1 })
            .lean();

          const unreadCount = await Message.countDocuments({
            conversationId: conv._id,
            direction: 'inbound',
            status: { $ne: 'read' }
          });

          return {
            id: conv._id.toString(),
            contactNumber: conv.contactNumber,
            contactName: conv.contactName,
            lastMessageAt: conv.lastMessageAt,
            status: conv.status,
            whatsappNumber: conv.whatsappNumberId,
            lastMessage: lastMessage ? {
              id: lastMessage._id.toString(),
              direction: lastMessage.direction,
              content: lastMessage.content,
              timestamp: lastMessage.timestamp,
            } : null,
            unreadCount,
          };
        })
      );

      return conversationsWithMessages;
    }),

  getConversation: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const conversation = await Conversation.findOne({
        _id: input.id,
        userId: ctx.user._id,
      })
        .populate('whatsappNumberId', 'number displayName')
        .lean();

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      return {
        id: conversation._id.toString(),
        contactNumber: conversation.contactNumber,
        contactName: conversation.contactName,
        lastMessageAt: conversation.lastMessageAt,
        sessionStartAt: conversation.sessionStartAt,
        sessionEndAt: conversation.sessionEndAt,
        status: conversation.status,
        whatsappNumber: conversation.whatsappNumberId,
      };
    }),

  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      skip: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { conversationId, limit, skip } = input;

      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId: ctx.user._id,
      });

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      const messages = await Message.find({ conversationId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return messages.reverse().map(message => ({
        id: message._id.toString(),
        messageId: message.messageId,
        direction: message.direction,
        content: message.content,
        status: message.status,
        timestamp: message.timestamp,
        isAutomated: message.isAutomated,
      }));
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.object({
        type: z.enum(['text', 'template']),
        text: z.string().optional(),
        templateName: z.string().optional(),
        templateParams: z.array(z.string()).optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const { conversationId, content } = input;

      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId: ctx.user._id,
      });

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      // Check if conversation is still active (within 24h window)
      const now = new Date();
      const sessionEnd = new Date(conversation.sessionStartAt.getTime() + 24 * 60 * 60 * 1000);
      
      if (now > sessionEnd && conversation.status === 'active') {
        // Update conversation status to expired
        await Conversation.findByIdAndUpdate(conversationId, {
          status: 'expired',
          sessionEndAt: sessionEnd,
        });

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Conversation session has expired (24h limit)',
        });
      }

      // Generate unique message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create message record
      const message = await Message.create({
        conversationId,
        messageId,
        direction: 'outbound',
        content,
        status: 'sent',
        timestamp: now,
        isAutomated: false,
      });

      // Update conversation last message time
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessageAt: now,
      });

      // Here you would send the actual message via WhatsApp Business API
      console.log('Sending message via WhatsApp API:', { conversationId, content });

      return {
        success: true,
        message: {
          id: message._id.toString(),
          messageId: message.messageId,
          direction: message.direction,
          content: message.content,
          status: message.status,
          timestamp: message.timestamp,
        },
      };
    }),

  markAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      messageIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { conversationId, messageIds } = input;

      // Verify conversation belongs to user
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId: ctx.user._id,
      });

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      const filter: any = {
        conversationId,
        direction: 'inbound',
        status: { $ne: 'read' }
      };

      if (messageIds && messageIds.length > 0) {
        filter._id = { $in: messageIds };
      }

      await Message.updateMany(filter, {
        status: 'read',
      });

      return { success: true };
    }),

  updateConversationStatus: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      status: z.enum(['active', 'expired', 'opted-out']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { conversationId, status } = input;

      const conversation = await Conversation.findOneAndUpdate(
        { _id: conversationId, userId: ctx.user._id },
        { 
          status,
          sessionEndAt: status !== 'active' ? new Date() : undefined,
        },
        { new: true }
      ).lean();

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      return { success: true };
    }),

  getConversationStats: protectedProcedure
    .input(z.object({
      whatsappNumberId: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { whatsappNumberId, dateFrom, dateTo } = input;

      const matchStage: any = { userId: ctx.user._id };
      if (whatsappNumberId) {
        matchStage.whatsappNumberId = whatsappNumberId;
      }
      if (dateFrom || dateTo) {
        matchStage.createdAt = {};
        if (dateFrom) matchStage.createdAt.$gte = dateFrom;
        if (dateTo) matchStage.createdAt.$lte = dateTo;
      }

      const stats = await Conversation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            expired: {
              $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
            },
            optedOut: {
              $sum: { $cond: [{ $eq: ['$status', 'opted-out'] }, 1, 0] }
            },
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        active: 0,
        expired: 0,
        optedOut: 0,
      };
    }),
});
