import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, auditedProcedure } from '@/server/trpc';
import { Workflow } from '@/lib/models';
import { TRPCError } from '@trpc/server';

export const workflowRouter = createTRPCRouter({
  getWorkflows: protectedProcedure
    .query(async ({ ctx }) => {
      const workflows = await Workflow.find({ userId: ctx.user._id })
        .sort({ updatedAt: -1 })
        .lean();

      return workflows.map(workflow => ({
        id: workflow._id.toString(),
        name: workflow.name,
        triggers: workflow.triggers,
        isActive: workflow.isActive,
        nodeCount: workflow.nodes ? Object.keys(workflow.nodes).length : 0,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      }));
    }),

  getWorkflow: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const workflow = await Workflow.findOne({
        _id: input.id,
        userId: ctx.user._id,
      }).lean();

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      return {
        id: workflow._id.toString(),
        name: workflow.name,
        triggers: workflow.triggers,
        nodes: workflow.nodes,
        isActive: workflow.isActive,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      };
    }),

  createWorkflow: auditedProcedure
    .input(z.object({
      name: z.string().min(2, 'Workflow name must be at least 2 characters'),
      triggers: z.array(z.string()).default([]),
      nodes: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, triggers, nodes } = input;

      const workflow = await Workflow.create({
        userId: ctx.user._id,
        name,
        triggers,
        nodes: nodes || {},
        isActive: false,
      });

      return {
        success: true,
        workflow: {
          id: workflow._id.toString(),
          name: workflow.name,
          triggers: workflow.triggers,
          nodes: workflow.nodes,
          isActive: workflow.isActive,
        },
      };
    }),

  updateWorkflow: auditedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      triggers: z.array(z.string()).optional(),
      nodes: z.any().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const workflow = await Workflow.findOneAndUpdate(
        { _id: id, userId: ctx.user._id },
        updateData,
        { new: true }
      ).lean();

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // Here you would sync with n8n if the workflow is active
      if (workflow.isActive && ctx.user.n8nApiKey) {
        // Implement n8n synchronization
        console.log('Syncing workflow with n8n:', workflow._id);
      }

      return {
        success: true,
        workflow: {
          id: workflow._id.toString(),
          name: workflow.name,
          triggers: workflow.triggers,
          nodes: workflow.nodes,
          isActive: workflow.isActive,
        },
      };
    }),

  deleteWorkflow: auditedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await Workflow.findOne({
        _id: input.id,
        userId: ctx.user._id,
      });

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // If workflow is active, deactivate it first
      if (workflow.isActive && ctx.user.n8nApiKey) {
        // Implement n8n deactivation
        console.log('Deactivating workflow in n8n:', workflow._id);
      }

      await Workflow.findByIdAndDelete(input.id);

      return { success: true };
    }),

  toggleWorkflow: auditedProcedure
    .input(z.object({
      id: z.string(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, isActive } = input;

      const workflow = await Workflow.findOneAndUpdate(
        { _id: id, userId: ctx.user._id },
        { isActive },
        { new: true }
      ).lean();

      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // Here you would activate/deactivate the workflow in n8n
      if (ctx.user.n8nApiKey) {
        console.log(`${isActive ? 'Activating' : 'Deactivating'} workflow in n8n:`, workflow._id);
        // Implement n8n API call
      }

      return {
        success: true,
        workflow: {
          id: workflow._id.toString(),
          name: workflow.name,
          isActive: workflow.isActive,
        },
      };
    }),

  duplicateWorkflow: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2, 'Workflow name must be at least 2 characters'),
    }))
    .mutation(async ({ ctx, input }) => {
      const originalWorkflow = await Workflow.findOne({
        _id: input.id,
        userId: ctx.user._id,
      }).lean();

      if (!originalWorkflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      const duplicatedWorkflow = await Workflow.create({
        userId: ctx.user._id,
        name: input.name,
        triggers: originalWorkflow.triggers,
        nodes: originalWorkflow.nodes,
        isActive: false, // Always create as inactive
      });

      return {
        success: true,
        workflow: {
          id: duplicatedWorkflow._id.toString(),
          name: duplicatedWorkflow.name,
          triggers: duplicatedWorkflow.triggers,
          nodes: duplicatedWorkflow.nodes,
          isActive: duplicatedWorkflow.isActive,
        },
      };
    }),
});
