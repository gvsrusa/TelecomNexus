import { cassandraClient } from './client';

export interface DailyUsageRow {
  date: string;
  dataUsedMB: number;
  voiceUsedSeconds: number;
  smsCount: number;
}

/**
 * Get daily usage for a customer in a given month.
 */
export async function getDailyUsage(customerId: string, month: string): Promise<DailyUsageRow[]> {
  const query = `
    SELECT date, data_mb, voice_minutes, sms_count
    FROM usage_by_day
    WHERE customer_id = ? AND month = ?
  `;

  const result = await cassandraClient.execute(query, [customerId, month], { prepare: true });

  return result.rows.map((row) => ({
    date: formatLocalDate(row['date'] as Date),
    dataUsedMB: Math.round(Number(row['data_mb'])),
    voiceUsedSeconds: Math.round(Number(row['voice_minutes']) * 60),
    smsCount: Number(row['sms_count']),
  }));
}

/**
 * Get current usage summary for a customer (current billing cycle).
 */
export async function getCurrentUsage(customerId: string): Promise<{
  dataUsedGB: number;
  voiceUsedMinutes: number;
  smsCount: number;
  billingCycleStart: Date;
  billingCycleEnd: Date;
}> {
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const daily = await getDailyUsage(customerId, month);

  let totalDataMB = 0;
  let totalVoiceSeconds = 0;
  let totalSms = 0;

  for (const d of daily) {
    totalDataMB += d.dataUsedMB;
    totalVoiceSeconds += d.voiceUsedSeconds;
    totalSms += d.smsCount;
  }

  // Billing cycle: 1st to last day of current month
  const billingCycleStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const billingCycleEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59),
  );

  return {
    dataUsedGB: Math.round((totalDataMB / 1024) * 100) / 100,
    voiceUsedMinutes: Math.round(totalVoiceSeconds / 60),
    smsCount: totalSms,
    billingCycleStart,
    billingCycleEnd,
  };
}

function formatLocalDate(d: Date): string {
  if (typeof d === 'string') return d;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
