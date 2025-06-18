import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();    // Check database connection
    console.log('Testing Supabase connection...');
    const { error: connectionError } = await supabaseAdmin.from('notes').select('*', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Connection error:', connectionError);
      return NextResponse.json({ success: false, error: connectionError }, { status: 500 });
    }
      // Get table schema
    console.log('Getting table schema...');
    let schema = null;
    try {
      const { data } = await supabaseAdmin.rpc('schema_info', {
        table_name: 'notes',
      });
      schema = data;
    } catch (schemaError) {
      console.warn('Schema info error (continuing):', schemaError);
    }

    // Check if realtime is enabled for notes table
    console.log('Checking realtime config...');
    let realtimeEnabled = false;
    try {
      // Try to get realtime config - this is a best effort check since there's no direct API
      // If you have proper admin access, you could check this through the Supabase Management API
      const channel = supabaseAdmin.channel('test');
      const status = channel.subscribe();
      realtimeEnabled = !!status;
    } catch (err) {
      console.warn('Could not check realtime status:', err);
    }

    // Count notes
    console.log('Counting notes...');
    const { count, error: countError } = await supabaseAdmin
      .from('notes')
      .select('*', { count: 'exact' });
    
    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ success: false, error: countError }, { status: 500 });
    }
    
    // Return test results
    return NextResponse.json({
      success: true,
      connected: true,
      count,
      schema,
      realtimeEnabled,
      env: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
