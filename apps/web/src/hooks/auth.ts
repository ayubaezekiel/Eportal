import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const session = await authClient.getSession();
      return session;
    },
  });
};
