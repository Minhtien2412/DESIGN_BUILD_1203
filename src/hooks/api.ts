import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { queryKeys } from "../services/queryClient";
import { useAuthStore } from "../store/auth";

// Auth hooks
export const useLogin = () => {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      // baseURL already contains /api/v1, so endpoint is /auth/login
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data;
      setSession(accessToken, refreshToken, user);
    },
  });
};

export const useRegister = () => {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: {
      name: string;
      email: string;
      phone: string;
      password: string;
      role: string;
    }) => {
      // baseURL already contains /api/v1, so endpoint is /auth/register
      const response = await api.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data;
      setSession(accessToken, refreshToken, user);
    },
  });
};

export const useSendOTP = () => {
  return useMutation({
    mutationFn: async ({ phone }: { phone: string }) => {
      // baseURL already contains /api/v1
      const response = await api.post("/auth/send-otp", { phone });
      return response.data;
    },
  });
};

export const useVerifyOTP = () => {
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      // baseURL already contains /api/v1
      const response = await api.post("/auth/verify-otp", { phone, otp });
      return response.data;
    },
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data;
      setSession(accessToken, refreshToken, user);
    },
  });
};

// User hooks
export const useUser = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: any;
    }) => {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user(variables.userId),
      });
    },
  });
};

// Project hooks
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      const response = await api.get("/projects");
      return response.data;
    },
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: any) => {
      const response = await api.post("/projects", projectData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      projectData,
    }: {
      projectId: string;
      projectData: any;
    }) => {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.project(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

// Message hooks
export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      const response = await api.get("/messages/conversations");
      return response.data;
    },
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: async () => {
      const response = await api.get(
        `/messages/conversations/${conversationId}`,
      );
      return response.data;
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      type = "text",
    }: {
      conversationId: string;
      content: string;
      type?: string;
    }) => {
      const response = await api.post(
        `/messages/conversations/${conversationId}/messages`,
        {
          content,
          type,
        },
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversation(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
};

// Contact hooks
export const useContacts = () => {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: async () => {
      const response = await api.get("/contacts");
      return response.data;
    },
  });
};

export const useAddContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: {
      name: string;
      email?: string;
      phone?: string;
    }) => {
      const response = await api.post("/contacts", contactData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts });
    },
  });
};

// Upload hooks
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: FormData) => {
      const response = await api.post("/uploads", file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
};

export const usePresignedUpload = () => {
  return useMutation({
    mutationFn: async ({
      fileName,
      fileType,
    }: {
      fileName: string;
      fileType: string;
    }) => {
      const response = await api.post("/uploads/presign", {
        fileName,
        fileType,
      });
      return response.data;
    },
  });
};
