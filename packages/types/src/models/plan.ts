import type { PlanCode } from '../branded';
import type { PlanTier } from '../enums';

export interface PlanFeatures {
  dataLimitGB: number | null;
  voiceMinutes: number | null;
  smsCount: number | null;
  hotspotGB: number;
  internationalRoaming: boolean;
  fiveGAccess: boolean;
}

export interface Plan {
  _id?: unknown;
  planCode: PlanCode;
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  features: PlanFeatures;
  isActive: boolean;
  tier: PlanTier;
}
