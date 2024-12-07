import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://rqdzocfqkcniftpnwdbm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZHpvY2Zxa2NuaWZ0cG53ZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MjI2OTMsImV4cCI6MjA0ODk5ODY5M30.y3V4FgYVaMlY1soaPLen7R4R-0XwgsF7On6IiMXJNu4'
    );
  }

  async getTodos() {
    const { data, error } = await this.supabase.from('todos').select();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
