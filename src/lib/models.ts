import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  metaAccessToken?: string;
  n8nApiKey?: string;
  // WhatsApp Business API Credentials (encrypted)
  whatsappClientId?: string;
  whatsappClientSecret?: string;
  whatsappAccessToken?: string;
  whatsappBusinessAccountId?: string;
  whatsappPhoneNumberId?: string;
  tier: 'basic' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface IWhatsAppNumber extends Document {
  userId: mongoose.Types.ObjectId;
  number: string;
  displayName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkflow extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  triggers: string[];
  nodes: any; // JSON workflow config from n8n
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  whatsappNumberId: mongoose.Types.ObjectId;
  contactNumber: string;
  contactName?: string;
  lastMessageAt: Date;
  sessionStartAt: Date;
  sessionEndAt?: Date;
  status: 'active' | 'expired' | 'opted-out';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  messageId: string; // WhatsApp message ID
  direction: 'inbound' | 'outbound';
  content: {
    type: 'text' | 'image' | 'document' | 'template';
    text?: string;
    mediaUrl?: string;
    templateName?: string;
    templateParams?: string[];
  };
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  isAutomated: boolean;
  createdAt: Date;
}

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String }, // Optional for OAuth users
  metaAccessToken: { type: String }, // Will be encrypted
  n8nApiKey: { type: String }, // Will be encrypted
  // WhatsApp Business API Credentials (will be encrypted)
  whatsappClientId: { type: String },
  whatsappClientSecret: { type: String },
  whatsappAccessToken: { type: String },
  whatsappBusinessAccountId: { type: String },
  whatsappPhoneNumberId: { type: String },
  tier: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
}, { timestamps: true });

// WhatsApp Number Schema
const WhatsAppNumberSchema = new Schema<IWhatsAppNumber>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  number: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

// Workflow Schema
const WorkflowSchema = new Schema<IWorkflow>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  triggers: [{ type: String }],
  nodes: { type: Schema.Types.Mixed }, // Flexible JSON storage
  isActive: { type: Boolean, default: false },
}, { timestamps: true });

// Conversation Schema
const ConversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  whatsappNumberId: { type: Schema.Types.ObjectId, ref: 'WhatsAppNumber', required: true },
  contactNumber: { type: String, required: true },
  contactName: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  sessionStartAt: { type: Date, default: Date.now },
  sessionEndAt: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'opted-out'], default: 'active' },
}, { timestamps: true });

// Message Schema
const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  messageId: { type: String, required: true, unique: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  content: {
    type: { type: String, enum: ['text', 'image', 'document', 'template'], required: true },
    text: { type: String },
    mediaUrl: { type: String },
    templateName: { type: String },
    templateParams: [{ type: String }],
  },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  timestamp: { type: Date, required: true },
  isAutomated: { type: Boolean, default: false },
}, { timestamps: true });

// Audit Log Schema
const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

// Create indexes for performance
WhatsAppNumberSchema.index({ userId: 1, number: 1 });
WorkflowSchema.index({ userId: 1, isActive: 1 });
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ConversationSchema.index({ whatsappNumberId: 1, contactNumber: 1 });
MessageSchema.index({ conversationId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });

// TTL index for automatic message cleanup after 30 days
MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const WhatsAppNumber = mongoose.models.WhatsAppNumber || mongoose.model<IWhatsAppNumber>('WhatsAppNumber', WhatsAppNumberSchema);
export const Workflow = mongoose.models.Workflow || mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
