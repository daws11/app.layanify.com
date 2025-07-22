import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/trpc';
import { User } from '@/lib/models';
import { encryptUserSensitiveFields } from '@/lib/encryption';
import { TRPCError } from '@trpc/server';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }))
    .mutation(async ({ input }) => {
      const { name, email, password } = input;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        tier: 'basic',
      });

      return {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          tier: user.tier,
        },
      };
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        id: ctx.user._id.toString(),
        name: ctx.user.name,
        email: ctx.user.email,
        tier: ctx.user.tier,
        hasMetaToken: !!ctx.user.metaAccessToken,
        hasN8nKey: !!ctx.user.n8nApiKey,
      };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      metaAccessToken: z.string().optional(),
      n8nApiKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {};

      if (input.name) {
        updateData.name = input.name;
      }

      // Encrypt sensitive fields if provided
      if (input.metaAccessToken) {
        const encrypted = encryptUserSensitiveFields({ metaAccessToken: input.metaAccessToken });
        updateData.metaAccessToken = encrypted.metaAccessToken;
      }

      if (input.n8nApiKey) {
        const encrypted = encryptUserSensitiveFields({ n8nApiKey: input.n8nApiKey });
        updateData.n8nApiKey = encrypted.n8nApiKey;
      }

      const updatedUser = await User.findByIdAndUpdate(
        ctx.user._id,
        updateData,
        { new: true }
      ).lean();

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        success: true,
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          tier: updatedUser.tier,
        },
      };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    }))
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      // Get user with password
      const user = await User.findById(ctx.user._id).select('+password');
      if (!user || !user.password) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot change password for OAuth users',
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await User.findByIdAndUpdate(ctx.user._id, {
        password: hashedPassword,
      });

      return { success: true };
    }),
});
