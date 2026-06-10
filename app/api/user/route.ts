import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// GET /api/user — fetch current user's full data
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('nsk_session')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });

    const admin = getSupabaseAdmin();

    // Fetch user
    const { data: user } = await admin
      .from('users')
      .select('id, name, email, is_admin, profile_completed, created_at')
      .eq('id', payload.sub)
      .single();

    // Fetch profile
    const { data: profile } = await admin
      .from('arrival_profiles')
      .select('*')
      .eq('user_id', payload.sub)
      .maybeSingle();

    // Fetch tasks
    const { data: tasks } = await admin
      .from('user_tasks')
      .select('*')
      .eq('user_id', payload.sub);

    // Fetch reminder prefs
    const { data: prefs } = await admin
      .from('reminder_prefs')
      .select('*')
      .eq('user_id', payload.sub)
      .maybeSingle();

    return NextResponse.json({
      user,
      profile,
      tasks: tasks || [],
      reminders: prefs || { emailReminders: false, frequency: 'weekly' },
    });
  } catch (err) {
    console.error('GET /api/user error:', err);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}

// PUT /api/user — update user data (profile, tasks, prefs)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('nsk_session')?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });

    const body = await request.json();
    const admin = getSupabaseAdmin();
    const userId = payload.sub;

    // Update profile if provided
    if (body.profile) {
      const p = body.profile;
      const { data: existingProfile } = await admin
        .from('arrival_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingProfile) {
        await admin.from('arrival_profiles').update(p).eq('user_id', userId);
      } else {
        await admin.from('arrival_profiles').insert({ ...p, user_id: userId });
      }
    }

    // Update tasks if provided
    if (body.tasks && Array.isArray(body.tasks)) {
      for (const task of body.tasks) {
        const { data: existingTask } = await admin
          .from('user_tasks')
          .select('id')
          .eq('user_id', userId)
          .eq('task_id', task.taskId || task.task_id)
          .maybeSingle();

        if (existingTask) {
          await admin.from('user_tasks').update({
            status: task.status,
            completed_at: task.status === 'complete' ? new Date().toISOString() : null,
          }).eq('id', existingTask.id);
        } else {
          await admin.from('user_tasks').insert({
            user_id: userId,
            task_id: task.taskId || task.task_id,
            status: task.status,
            completed_at: task.status === 'complete' ? new Date().toISOString() : null,
          });
        }
      }
    }

    // Update reminder prefs if provided
    if (body.reminders) {
      const r = body.reminders;
      const { data: existingPrefs } = await admin
        .from('reminder_prefs')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingPrefs) {
        await admin.from('reminder_prefs').update({
          email_reminders: r.emailReminders ?? r.email_reminders,
          frequency: r.frequency,
        }).eq('id', existingPrefs.id);
      } else {
        await admin.from('reminder_prefs').insert({
          user_id: userId,
          email_reminders: r.emailReminders ?? r.email_reminders ?? false,
          frequency: r.frequency || 'weekly',
        });
      }
    }

    // Update profile_completed flag on user
    if (body.profileCompleted !== undefined) {
      await admin.from('users').update({ profile_completed: body.profileCompleted }).eq('id', userId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/user error:', err);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
