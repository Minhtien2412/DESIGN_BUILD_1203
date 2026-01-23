/**
 * API Integration Hooks
 * ======================
 *
 * React hooks để sử dụng API integration dễ dàng trong components
 * - Auto loading states
 * - Error handling
 * - Data caching
 * - Refetch logic
 *
 * @author ThietKeResort Team
 * @created 2025-12-31
 */

import {
    ApiIntegration,
    ApiResponse,
    MainApiIntegration,
    PerfexApiIntegration,
} from "@/services/apiIntegration";
import { useCallback, useEffect, useState } from "react";

// ==================== TYPES ====================

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  source: "api" | "mock" | "cache" | null;
  timestamp: number | null;
}

export interface UseApiOptions {
  enabled?: boolean;
  cache?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

// ==================== GENERIC HOOK ====================

/**
 * Generic hook for API calls
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {},
): UseApiState<T> & {
  refetch: () => Promise<void>;
  clearData: () => void;
} {
  const {
    enabled = true,
    cache: _cache = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    source: null,
    timestamp: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetcher();

      setState({
        data: response.data,
        loading: false,
        error: null,
        source: response.source,
        timestamp: response.timestamp,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error: any) {
      const err =
        error instanceof Error
          ? error
          : new Error(error.message || "Unknown error");

      setState({
        data: null,
        loading: false,
        error: err,
        source: null,
        timestamp: Date.now(),
      });

      if (onError) {
        onError(err);
      }
    }
  }, [fetcher, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearData = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      source: null,
      timestamp: null,
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  // Auto refetch interval
  useEffect(() => {
    if (enabled && refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [enabled, refetchInterval, fetchData]);

  return {
    ...state,
    refetch,
    clearData,
  };
}

// ==================== MAIN API HOOKS ====================

/**
 * Get construction projects
 */
export function useProjects(options?: UseApiOptions) {
  return useApi(() => MainApiIntegration.getProjects(), options);
}

/**
 * Get project details
 */
export function useProject(projectId: string, options?: UseApiOptions) {
  return useApi(() => MainApiIntegration.getProject(projectId), {
    enabled: !!projectId,
    ...options,
  });
}

/**
 * Get project tasks
 */
export function useProjectTasks(projectId: string, options?: UseApiOptions) {
  return useApi(() => MainApiIntegration.getProjectTasks(projectId), {
    enabled: !!projectId,
    ...options,
  });
}

// ==================== PERFEX CRM HOOKS ====================

/**
 * Get Perfex customers
 */
export function usePerfexCustomers(options?: UseApiOptions) {
  return useApi(() => PerfexApiIntegration.getCustomers(), options);
}

/**
 * Get Perfex projects
 */
export function usePerfexProjects(options?: UseApiOptions) {
  return useApi(() => PerfexApiIntegration.getProjects(), options);
}

/**
 * Get Perfex project details
 */
export function usePerfexProject(projectId: string, options?: UseApiOptions) {
  return useApi(() => PerfexApiIntegration.getProject(projectId), {
    enabled: !!projectId,
    ...options,
  });
}

// ==================== MUTATION HOOKS ====================

export interface UseMutationState {
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
}

/**
 * Generic mutation hook
 */
export function useMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: UseMutationOptions<T, V> = {},
): UseMutationState & {
  mutate: (variables: V) => Promise<T | null>;
  reset: () => void;
} {
  const { onSuccess, onError } = options;

  const [state, setState] = useState<UseMutationState>({
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      setState({ loading: true, error: null, success: false });

      try {
        const response = await mutationFn(variables);

        setState({ loading: false, error: null, success: true });

        if (onSuccess) {
          onSuccess(response.data, variables);
        }

        return response.data;
      } catch (error: any) {
        const err =
          error instanceof Error
            ? error
            : new Error(error.message || "Unknown error");

        setState({ loading: false, error: err, success: false });

        if (onError) {
          onError(err, variables);
        }

        return null;
      }
    },
    [mutationFn, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

/**
 * Create project mutation
 */
export function useCreateProject(options?: UseMutationOptions<any, any>) {
  return useMutation(
    (data: any) => MainApiIntegration.createProject(data),
    options,
  );
}

/**
 * Update project mutation
 */
export function useUpdateProject(
  options?: UseMutationOptions<any, { id: string; data: any }>,
) {
  return useMutation(
    ({ id, data }: { id: string; data: any }) =>
      MainApiIntegration.updateProject(id, data),
    options,
  );
}

/**
 * Delete project mutation
 */
export function useDeleteProject(
  options?: UseMutationOptions<{ success: boolean }, string>,
) {
  return useMutation(
    (id: string) => MainApiIntegration.deleteProject(id),
    options,
  );
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook to clear cache
 */
export function useClearCache() {
  return useCallback((pattern?: string) => {
    ApiIntegration.clearCache(pattern);
  }, []);
}

/**
 * Hook to check if data is cached
 */
export function useIsCached(cacheKey: string) {
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    setIsCached(ApiIntegration.isCached(cacheKey));
  }, [cacheKey]);

  return isCached;
}

// ==================== EXAMPLE USAGE ====================

/*
// Component example 1: List projects
function ProjectList() {
  const { data, loading, error, source, refetch } = useProjects({
    cache: true,
    onSuccess: (projects) => {
      console.log('Projects loaded:', projects);
    },
  });

  if (loading) return <Loader />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {source === 'mock' && <Text>Using offline data</Text>}
      <FlatList
        data={data}
        renderItem={({ item }) => <ProjectCard project={item} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      />
    </View>
  );
}

// Component example 2: Create project
function CreateProjectForm() {
  const { mutate, loading, error, success } = useCreateProject({
    onSuccess: (project) => {
      console.log('Project created:', project);
      router.push(`/projects/${project.id}`);
    },
  });

  const handleSubmit = async (formData) => {
    const result = await mutate(formData);
    if (result) {
      Alert.alert('Success', 'Project created!');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input name="name" />
      <Button loading={loading}>Create</Button>
      {error && <Text>{error.message}</Text>}
      {success && <Text>Created successfully!</Text>}
    </Form>
  );
}

// Component example 3: Perfex customers
function CustomerList() {
  const { data, loading, source } = usePerfexCustomers({
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  return (
    <View>
      {source === 'api' && <Badge>Live data</Badge>}
      {source === 'mock' && <Badge color="orange">Offline</Badge>}
      {source === 'cache' && <Badge color="gray">Cached</Badge>}
      
      {loading && <Loader />}
      {data?.map(customer => (
        <CustomerCard key={customer.userid} customer={customer} />
      ))}
    </View>
  );
}
*/
