import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export async function ensureUserProfile(user: User): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Creating profile for user:', user.id);
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
        });

      if (createProfileError) {
        console.error('Failed to create profile:', createProfileError);
        return { 
          success: false, 
          error: 'Failed to create user profile. Please try again or contact support.' 
        };
      }

      console.log('Profile created successfully');
      return { success: true };
    } else if (profileError) {
      console.error('Error checking profile:', profileError);
      return { 
        success: false, 
        error: 'Failed to verify user profile. Please try again.' 
      };
    }

    // Profile exists
    return { success: true };
  } catch (error) {
    console.error('Error during profile check:', error);
    return { 
      success: false, 
      error: 'Failed to verify user account. Please try again.' 
    };
  }
}
