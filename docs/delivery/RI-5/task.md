# RI-5: Supabase Schema for Progress Tracking

## Description
Create Supabase schema for reading progress and resource views tracking.

## Requirements
- Create `reading_progress` table schema
- Create `resource_views` table schema
- Add proper indexes and foreign keys
- Add RLS policies for user privacy

## Implementation Plan
1. Define Supabase schema in SQL
2. Add migration files
3. Create edge functions for analytics
4. Add RLS policies

## Test Plan
- Unit tests for schema validation
- Integration tests with Supabase
- RLS policy tests
- Performance tests for analytics queries

## Files Modified
- `/supabase/migrations/20250727180000_resource_tracking.sql`
- `/supabase/seed.sql` (test data)
- `/edge-functions/analytics-aggregation/index.ts` (edge function)
- `/tests/supabase/resource_tracking.test.ts`
