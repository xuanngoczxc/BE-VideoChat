import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase.services';

@Controller('todos')
export class SupabaseController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getTodos() {
    return this.supabaseService.getTodos();
  }
}
