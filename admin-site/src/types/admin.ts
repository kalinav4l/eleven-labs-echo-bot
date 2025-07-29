export interface AdminUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  user_role: 'admin' | 'moderator' | 'user';
  balance_usd: number;
  total_calls: number;
  total_minutes: number;
  created_at: string;
  last_sign_in: string | null;
}

export interface AdminStats {
  total_users: number;
  total_calls: number;
  total_revenue: number;
  active_users_today: number;
  banned_users: number;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  action: string;
  details: any;
  ip_address: string | null;
  created_at: string;
}