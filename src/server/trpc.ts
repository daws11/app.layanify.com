import { initTRPC, TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/lib/models';
import { decryptUserSensitiveFields } from '@/lib/encryption';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

/**
 * Creates context for tRPC requests
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  // Connect to database
  await connectToDatabase();
  
  // Create NextRequest/NextResponse for session
  const req = opts.req;
  const res = new Response();
  
  // Extract session from request
  let session;
  try {
    // For Next.js App Router, we need to pass req/res to getServerSession
    session = await getServerSession({ req, res } as any, authOptions);
  } catch (error) {
    console.error('Session error:', error);
    session = null;
  }
  
  return {
    session,
    req,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause?.name === 'ZodError' ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user?.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }

    // Get full user data from database
    const dbUser = await User.findOne({ email: ctx.session.user.email }).lean();
    if (!dbUser) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
    }

    // Decrypt sensitive fields if they exist
    const decryptedUser = decryptUserSensitiveFields(dbUser);

    return next({
      ctx: {
        ...ctx,
        user: decryptedUser,
      },
    });
  })
);

/**
 * Admin-only procedure
 */
export const adminProcedure = protectedProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (ctx.user.tier !== 'enterprise') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }

    return next({ ctx });
  })
);

/**
 * Procedure with audit logging
 */
export const auditedProcedure = protectedProcedure.use(
  t.middleware(async ({ ctx, next, path, type }) => {
    const result = await next({ ctx });

    // Log the action (implement AuditLog creation here)
    // This is a placeholder - implement full audit logging as needed
    console.log(`Audited action: ${type} ${path} by user ${ctx.user._id}`);

    return result;
  })
);
