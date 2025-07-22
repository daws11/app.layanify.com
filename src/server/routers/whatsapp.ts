import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, auditedProcedure } from '@/server/trpc';
import { WhatsAppNumber } from '@/lib/models';
import { TRPCError } from '@trpc/server';

export const whatsappRouter = createTRPCRouter({
  getNumbers: protectedProcedure
    .query(async ({ ctx }) => {
      const numbers = await WhatsAppNumber.find({ userId: ctx.user._id })
        .sort({ createdAt: -1 })
        .lean();

      return numbers.map(number => ({
        id: number._id.toString(),
        number: number.number,
        displayName: number.displayName,
        status: number.status,
        createdAt: number.createdAt,
      }));
    }),

  addNumber: auditedProcedure
    .input(z.object({
      number: z.string().regex(/^\+\d{10,15}$/, 'Invalid phone number format'),
      displayName: z.string().min(2, 'Display name must be at least 2 characters'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { number, displayName } = input;

      // Check if number already exists
      const existingNumber = await WhatsAppNumber.findOne({ number });
      if (existingNumber) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This WhatsApp number is already registered',
        });
      }

      // Create new WhatsApp number
      const whatsappNumber = await WhatsAppNumber.create({
        userId: ctx.user._id,
        number,
        displayName,
        status: 'pending',
      });

      // Here you would typically integrate with Meta's Business API
      // to initiate the verification process

      return {
        success: true,
        number: {
          id: whatsappNumber._id.toString(),
          number: whatsappNumber.number,
          displayName: whatsappNumber.displayName,
          status: whatsappNumber.status,
        },
      };
    }),

  updateNumber: auditedProcedure
    .input(z.object({
      id: z.string(),
      displayName: z.string().min(2).optional(),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const whatsappNumber = await WhatsAppNumber.findOneAndUpdate(
        { _id: id, userId: ctx.user._id },
        updateData,
        { new: true }
      ).lean();

      if (!whatsappNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'WhatsApp number not found',
        });
      }

      return {
        success: true,
        number: {
          id: whatsappNumber._id.toString(),
          number: whatsappNumber.number,
          displayName: whatsappNumber.displayName,
          status: whatsappNumber.status,
        },
      };
    }),

  deleteNumber: auditedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await WhatsAppNumber.findOneAndDelete({
        _id: input.id,
        userId: ctx.user._id,
      });

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'WhatsApp number not found',
        });
      }

      return { success: true };
    }),

  verifyNumber: protectedProcedure
    .input(z.object({
      id: z.string(),
      verificationCode: z.string().length(6, 'Verification code must be 6 digits'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, verificationCode } = input;

      const whatsappNumber = await WhatsAppNumber.findOne({
        _id: id,
        userId: ctx.user._id,
        status: 'pending',
      });

      if (!whatsappNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'WhatsApp number not found or already verified',
        });
      }

      // Here you would verify the code with Meta's API
      // For now, we'll simulate verification
      const isValidCode = verificationCode === '123456'; // Placeholder

      if (!isValidCode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid verification code',
        });
      }

      // Update status to approved
      await WhatsAppNumber.findByIdAndUpdate(id, {
        status: 'approved',
      });

      return { success: true };
    }),

  getBusinessProfile: protectedProcedure
    .input(z.object({
      numberId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const whatsappNumber = await WhatsAppNumber.findOne({
        _id: input.numberId,
        userId: ctx.user._id,
        status: 'approved',
      });

      if (!whatsappNumber) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'WhatsApp number not found or not verified',
        });
      }

      // Here you would fetch the business profile from Meta's API
      // For now, return mock data
      return {
        displayName: whatsappNumber.displayName,
        about: 'Business description here',
        address: 'Business address',
        description: 'Extended business description',
        email: ctx.user.email,
        websites: [],
        vertical: 'OTHER',
      };
    }),
});
