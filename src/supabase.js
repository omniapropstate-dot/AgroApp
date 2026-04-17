import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ztmlkebzxgisobtzrvlu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWxrZWJ6eGdpc29idHpydmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzkwOTksImV4cCI6MjA5MjAxNTA5OX0.Q21Mo5AcLB0XvV8h0sBFCFV8xxdQa37jjp0kgwRP5fc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
