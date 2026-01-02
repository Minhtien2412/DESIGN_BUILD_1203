import * as qcService from '@/services/qc-qa';
import type {
    AddDefectCommentRequest,
    Checklist,
    ComplianceReport,
    CreateChecklistRequest,
    CreateDefectRequest,
    CreateInspectionRequest,
    Defect,
    GenerateComplianceReportRequest,
    GetChecklistsParams,
    GetDefectsParams,
    GetInspectionsParams,
    GetQualityMetricsParams,
    Inspection,
    QualityMetrics,
    UpdateChecklistItemRequest,
    UpdateChecklistRequest,
    UpdateDefectRequest,
    UpdateInspectionRequest
} from '@/types/qc-qa';
import { useCallback, useState } from 'react';

// ============ Checklists Hook ============

interface UseChecklistsState {
  checklists: Checklist[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

export function useChecklists() {
  const [state, setState] = useState<UseChecklistsState>({
    checklists: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
  });

  const loadChecklists = useCallback(async (params: GetChecklistsParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await qcService.getChecklists(params);
      // Safely handle response - guard against undefined
      setState({
        checklists: response?.checklists ?? [],
        total: response?.total ?? 0,
        page: response?.page ?? params.page ?? 1,
        limit: response?.limit ?? params.limit ?? 20,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        checklists: [],
        total: 0,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load checklists',
      }));
    }
  }, []);

  const loadChecklistById = useCallback(
    async (id: string): Promise<Checklist | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.getChecklistById(id);
        setState((prev) => ({ ...prev, loading: false }));
        return response.checklist;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to load checklist',
        }));
        return null;
      }
    },
    []
  );

  const createChecklist = useCallback(
    async (data: CreateChecklistRequest): Promise<Checklist | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.createChecklist(data);
        setState((prev) => ({
          ...prev,
          checklists: [response.checklist, ...prev.checklists],
          total: prev.total + 1,
          loading: false,
        }));
        return response.checklist;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to create checklist',
        }));
        return null;
      }
    },
    []
  );

  const updateChecklist = useCallback(
    async (
      id: string,
      data: UpdateChecklistRequest
    ): Promise<Checklist | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.updateChecklist(id, data);
        setState((prev) => ({
          ...prev,
          checklists: prev.checklists.map((c) =>
            c.id === id ? response.checklist : c
          ),
          loading: false,
        }));
        return response.checklist;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to update checklist',
        }));
        return null;
      }
    },
    []
  );

  const updateChecklistItem = useCallback(
    async (
      checklistId: string,
      itemId: string,
      data: UpdateChecklistItemRequest
    ): Promise<Checklist | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.updateChecklistItem(
          checklistId,
          itemId,
          data
        );
        setState((prev) => ({
          ...prev,
          checklists: prev.checklists.map((c) =>
            c.id === checklistId ? response.checklist : c
          ),
          loading: false,
        }));
        return response.checklist;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to update checklist item',
        }));
        return null;
      }
    },
    []
  );

  const deleteChecklist = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await qcService.deleteChecklist(id);
      setState((prev) => ({
        ...prev,
        checklists: prev.checklists.filter((c) => c.id !== id),
        total: prev.total - 1,
        loading: false,
      }));
      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : 'Failed to delete checklist',
      }));
      return false;
    }
  }, []);

  const submitChecklistForApproval = useCallback(
    async (id: string): Promise<Checklist | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.submitChecklistForApproval(id);
        setState((prev) => ({
          ...prev,
          checklists: prev.checklists.map((c) =>
            c.id === id ? response.checklist : c
          ),
          loading: false,
        }));
        return response.checklist;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to submit',
        }));
        return null;
      }
    },
    []
  );

  const approveChecklist = useCallback(
    async (id: string): Promise<Checklist | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.approveChecklist(id);
        setState((prev) => ({
          ...prev,
          checklists: prev.checklists.map((c) =>
            c.id === id ? response.checklist : c
          ),
          loading: false,
        }));
        return response.checklist;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to approve',
        }));
        return null;
      }
    },
    []
  );

  return {
    ...state,
    loadChecklists,
    loadChecklistById,
    createChecklist,
    updateChecklist,
    updateChecklistItem,
    deleteChecklist,
    submitChecklistForApproval,
    approveChecklist,
  };
}

// ============ Inspections Hook ============

interface UseInspectionsState {
  inspections: Inspection[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

export function useInspections() {
  const [state, setState] = useState<UseInspectionsState>({
    inspections: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
  });

  const loadInspections = useCallback(async (params: GetInspectionsParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await qcService.getInspections(params);
      setState({
        inspections: response.inspections,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : 'Failed to load inspections',
      }));
    }
  }, []);

  const loadInspectionById = useCallback(
    async (id: string): Promise<Inspection | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.getInspectionById(id);
        setState((prev) => ({ ...prev, loading: false }));
        return response.inspection;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to load inspection',
        }));
        return null;
      }
    },
    []
  );

  const createInspection = useCallback(
    async (data: CreateInspectionRequest): Promise<Inspection | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.createInspection(data);
        setState((prev) => ({
          ...prev,
          inspections: [response.inspection, ...prev.inspections],
          total: prev.total + 1,
          loading: false,
        }));
        return response.inspection;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to create inspection',
        }));
        return null;
      }
    },
    []
  );

  const updateInspection = useCallback(
    async (
      id: string,
      data: UpdateInspectionRequest
    ): Promise<Inspection | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.updateInspection(id, data);
        setState((prev) => ({
          ...prev,
          inspections: prev.inspections.map((i) =>
            i.id === id ? response.inspection : i
          ),
          loading: false,
        }));
        return response.inspection;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to update inspection',
        }));
        return null;
      }
    },
    []
  );

  const deleteInspection = useCallback(
    async (id: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await qcService.deleteInspection(id);
        setState((prev) => ({
          ...prev,
          inspections: prev.inspections.filter((i) => i.id !== id),
          total: prev.total - 1,
          loading: false,
        }));
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to delete inspection',
        }));
        return false;
      }
    },
    []
  );

  const completeInspection = useCallback(
    async (id: string): Promise<Inspection | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.completeInspection(id);
        setState((prev) => ({
          ...prev,
          inspections: prev.inspections.map((i) =>
            i.id === id ? response.inspection : i
          ),
          loading: false,
        }));
        return response.inspection;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to complete',
        }));
        return null;
      }
    },
    []
  );

  return {
    ...state,
    loadInspections,
    loadInspectionById,
    createInspection,
    updateInspection,
    deleteInspection,
    completeInspection,
  };
}

// ============ Defects Hook ============

interface UseDefectsState {
  defects: Defect[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

export function useDefects() {
  const [state, setState] = useState<UseDefectsState>({
    defects: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
    limit: 20,
  });

  const loadDefects = useCallback(async (params: GetDefectsParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await qcService.getDefects(params);
      setState({
        defects: response.defects,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load defects',
      }));
    }
  }, []);

  const loadDefectById = useCallback(
    async (id: string): Promise<Defect | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.getDefectById(id);
        setState((prev) => ({ ...prev, loading: false }));
        return response.defect;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load defect',
        }));
        return null;
      }
    },
    []
  );

  const createDefect = useCallback(
    async (data: CreateDefectRequest): Promise<Defect | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.createDefect(data);
        setState((prev) => ({
          ...prev,
          defects: [response.defect, ...prev.defects],
          total: prev.total + 1,
          loading: false,
        }));
        return response.defect;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to create defect',
        }));
        return null;
      }
    },
    []
  );

  const updateDefect = useCallback(
    async (id: string, data: UpdateDefectRequest): Promise<Defect | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.updateDefect(id, data);
        setState((prev) => ({
          ...prev,
          defects: prev.defects.map((d) =>
            d.id === id ? response.defect : d
          ),
          loading: false,
        }));
        return response.defect;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to update defect',
        }));
        return null;
      }
    },
    []
  );

  const deleteDefect = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await qcService.deleteDefect(id);
      setState((prev) => ({
        ...prev,
        defects: prev.defects.filter((d) => d.id !== id),
        total: prev.total - 1,
        loading: false,
      }));
      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to delete defect',
      }));
      return false;
    }
  }, []);

  const addComment = useCallback(
    async (
      defectId: string,
      data: AddDefectCommentRequest
    ): Promise<Defect | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.addDefectComment(defectId, data);
        setState((prev) => ({
          ...prev,
          defects: prev.defects.map((d) =>
            d.id === defectId ? response.defect : d
          ),
          loading: false,
        }));
        return response.defect;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to add comment',
        }));
        return null;
      }
    },
    []
  );

  const resolveDefect = useCallback(
    async (id: string, resolution: string): Promise<Defect | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.resolveDefect(id, resolution);
        setState((prev) => ({
          ...prev,
          defects: prev.defects.map((d) =>
            d.id === id ? response.defect : d
          ),
          loading: false,
        }));
        return response.defect;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to resolve',
        }));
        return null;
      }
    },
    []
  );

  const verifyDefect = useCallback(async (id: string): Promise<Defect | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await qcService.verifyDefect(id);
      setState((prev) => ({
        ...prev,
        defects: prev.defects.map((d) =>
          d.id === id ? response.defect : d
        ),
        loading: false,
      }));
      return response.defect;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to verify',
      }));
      return null;
    }
  }, []);

  const closeDefect = useCallback(async (id: string): Promise<Defect | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await qcService.closeDefect(id);
      setState((prev) => ({
        ...prev,
        defects: prev.defects.map((d) =>
          d.id === id ? response.defect : d
        ),
        loading: false,
      }));
      return response.defect;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to close',
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    loadDefects,
    loadDefectById,
    createDefect,
    updateDefect,
    deleteDefect,
    addComment,
    resolveDefect,
    verifyDefect,
    closeDefect,
  };
}

// ============ Quality Metrics Hook ============

interface UseQualityMetricsState {
  metrics: QualityMetrics | null;
  loading: boolean;
  error: string | null;
}

export function useQualityMetrics() {
  const [state, setState] = useState<UseQualityMetricsState>({
    metrics: null,
    loading: false,
    error: null,
  });

  const loadMetrics = useCallback(async (params: GetQualityMetricsParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await qcService.getQualityMetrics(params);
      setState({
        metrics: response.metrics,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load metrics',
      }));
    }
  }, []);

  return {
    ...state,
    loadMetrics,
  };
}

// ============ Compliance Reports Hook ============

interface UseComplianceReportsState {
  report: ComplianceReport | null;
  loading: boolean;
  error: string | null;
}

export function useComplianceReports() {
  const [state, setState] = useState<UseComplianceReportsState>({
    report: null,
    loading: false,
    error: null,
  });

  const generateReport = useCallback(
    async (
      data: GenerateComplianceReportRequest
    ): Promise<ComplianceReport | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.generateComplianceReport(data);
        setState({
          report: response.report,
          loading: false,
          error: null,
        });
        return response.report;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to generate report',
        }));
        return null;
      }
    },
    []
  );

  const loadReportById = useCallback(
    async (id: string): Promise<ComplianceReport | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await qcService.getComplianceReportById(id);
        setState({
          report: response.report,
          loading: false,
          error: null,
        });
        return response.report;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load report',
        }));
        return null;
      }
    },
    []
  );

  const downloadPDF = useCallback(async (reportId: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const blob = await qcService.downloadComplianceReportPDF(reportId);
      // Handle blob download
      // This would typically open the PDF or download it
      setState((prev) => ({ ...prev, loading: false }));
      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to download PDF',
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    generateReport,
    loadReportById,
    downloadPDF,
  };
}
