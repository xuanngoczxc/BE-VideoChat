import { Module } from '@nestjs/common';
import { SupabaseController } from './supbase.controller';
import { SupabaseService } from './supabase.services';

@Module({
  controllers: [SupabaseController],
  providers: [SupabaseService],
})
export class SupabaseModule {}
