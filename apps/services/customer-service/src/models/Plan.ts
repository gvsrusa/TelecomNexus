import mongoose, { Schema } from 'mongoose';

export interface IPlan {
  planCode: string;
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  features: {
    dataLimitGB: number | null;
    voiceMinutes: number | null;
    smsCount: number | null;
    hotspotGB: number;
    internationalRoaming: boolean;
    fiveGAccess: boolean;
  };
  isActive: boolean;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';
}

const planSchema = new Schema<IPlan>({
  planCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  monthlyPrice: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  features: {
    dataLimitGB: { type: Number, default: null },
    voiceMinutes: { type: Number, default: null },
    smsCount: { type: Number, default: null },
    hotspotGB: { type: Number, required: true },
    internationalRoaming: { type: Boolean, default: false },
    fiveGAccess: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  tier: {
    type: String,
    enum: ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'],
    required: true,
  },
});

export const PlanModel = mongoose.model<IPlan>('Plan', planSchema);
