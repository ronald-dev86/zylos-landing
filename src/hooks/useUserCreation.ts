import { useState, useEffect } from 'react';
import { createClient } from '@/infrastructure/supabase-client/client';

export function useUserCreation(userId: string, tenantId: string) {
  const [isCreating, setIsCreating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        
        if (data) {
          setUser(data);
          setIsCreating(false);
        } else {
          setError('Usuario no encontrado');
          setIsCreating(false);
        }
      } catch (err) {
        setError('Error verificando usuario');
        setIsCreating(false);
      }
    };

    checkUserStatus();
  }, [userId, tenantId]);

  return { isCreating, error, user };
}