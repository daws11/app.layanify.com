import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, auditedProcedure } from '@/server/trpc';
import { WhatsAppNumber, User } from '@/lib/models';
import { TRPCError } from '@trpc/server';
import { WhatsAppBusinessAPI } from '@/lib/whatsapp-api';
import { decryptUserSensitiveFields } from '@/lib/encryption';

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

  testConnection: protectedProcedure
    .input(z.object({
      accessToken: z.string(),
      phoneNumberId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const whatsappAPI = new WhatsAppBusinessAPI(
          input.accessToken,
          input.phoneNumberId
        );

        const result = await whatsappAPI.testConnection();

        if (result.isConnected && result.profile) {
          return {
            isConnected: true,
            phoneNumbers: [{
              id: result.profile.phone_number_id,
              number: result.profile.display_phone_number,
              displayName: result.profile.about || 'WhatsApp Business',
              status: 'approved' as const,
            }],
          };
        }

        return {
          isConnected: false,
          phoneNumbers: [],
          error: result.error,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Failed to test connection',
        });
      }
    }),

  sendCredentialsToN8n: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Get user with WhatsApp credentials
        const user = await User.findById(ctx.user._id).lean();
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Decrypt user's sensitive fields
        const decryptedUser = decryptUserSensitiveFields(user);

        // Check if user has WhatsApp credentials
        if (!decryptedUser.whatsappClientId || 
            !decryptedUser.whatsappClientSecret || 
            !decryptedUser.whatsappAccessToken || 
            !decryptedUser.whatsappBusinessAccountId || 
            !decryptedUser.whatsappPhoneNumberId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'WhatsApp credentials not configured',
          });
        }

        // Prepare payload for n8n
        const n8nPayload = {
          userId: user._id.toString(),
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          whatsappCredentials: {
            clientId: decryptedUser.whatsappClientId,
            clientSecret: decryptedUser.whatsappClientSecret,
            accessToken: decryptedUser.whatsappAccessToken,
            businessAccountId: decryptedUser.whatsappBusinessAccountId,
            phoneNumberId: decryptedUser.whatsappPhoneNumberId,
          },
          // Additional metadata for n8n workflow
          metadata: {
            source: 'layanify-crm',
            version: '1.0.0',
            action: 'whatsapp_credentials_update',
          }
        };

        // Send credentials to n8n
        const response = await fetch('https://primary-production-9778.up.railway.app/webhook-test/2c73b5be-5924-44a4-942c-55c2d1836d77', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload),
        });

        if (!response.ok) {
          console.error('Failed to send credentials to n8n:', response.status, response.statusText);
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Failed to send credentials to n8n',
          });
        }

        const n8nResponse = await response.json();

        return {
          success: true,
          message: 'WhatsApp credentials sent to n8n successfully',
          n8nResponse,
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error sending credentials to n8n:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send credentials to n8n',
        });
      }
    }),
});
