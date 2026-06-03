/**
 * 어드민 활동 로그 기록 유틸
 * 반드시 서버사이드(API Route)에서만 호출
 */
import { createServiceClient } from '@/lib/supabase/server';

interface LogParams {
  adminId:    string;
  adminEmail: string;
  action:     string;       // 예: 'APPLICATION_STATUS_CHANGED'
  targetType?: string;      // 예: 'application', 'event', 'member'
  targetId?:   string;
  detail?:     Record<string, unknown>;
  ipAddress?:  string;
}

export async function logAdminAction(params: LogParams) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supa = createServiceClient() as any;
    const { error } = await supa.from('admin_logs').insert({
      admin_id:    params.adminId,
      admin_email: params.adminEmail,
      action:      params.action,
      target_type: params.targetType ?? null,
      target_id:   params.targetId   ?? null,
      detail:      params.detail     ?? null,
      ip_address:  params.ipAddress  ?? null,
    });
    if (error) console.error('[AdminLog Error]', error.message);
  } catch (e) {
    console.error('[AdminLog Error]', e);
  }
}
