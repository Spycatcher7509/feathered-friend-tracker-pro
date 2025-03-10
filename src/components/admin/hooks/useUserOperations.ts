
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useUserOperations(onSuccess: () => void) {
  const { toast } = useToast();

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${currentStatus ? "demoted" : "promoted"} successfully`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return {
    toggleAdminStatus,
    deleteUser
  };
}
