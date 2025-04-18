
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Get the Authorization header from the request
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Extract token from Authorization header
  const token = authHeader.replace('Bearer ', '')
  
  // Verify the user token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  // Check if user is admin by querying the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profileData || profileData.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  // This is an admin endpoint, handle different operations
  const { pathname } = new URL(req.url)
  
  // Get all users (including profiles)
  if (pathname.endsWith('/users') && req.method === 'GET') {
    // Get auth users
    const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      return new Response(JSON.stringify({ error: usersError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      return new Response(JSON.stringify({ error: profilesError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    // Combine auth users with profiles
    const users = authUsers.users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id) || { role: 'member' }
      return {
        id: authUser.id,
        email: authUser.email,
        user_metadata: {
          role: profile.role || 'member',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Unknown'
        },
        created_at: authUser.created_at
      }
    })
    
    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
})
