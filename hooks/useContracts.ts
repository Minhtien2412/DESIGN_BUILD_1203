// Contract Custom Hooks
import * as contractService from '@/services/contracts';
import type {
    Contract,
    ContractCreateRequest,
    ContractDocument,
    ContractSignRequest,
    ContractStats,
    ContractTemplate,
    ContractUpdateRequest,
    Milestone,
    MilestoneCreateRequest,
    MilestoneStats,
    MilestoneUpdateRequest,
    Signature,
} from '@/types/contracts';
import { useCallback, useEffect, useState } from 'react';

// Hook for managing contracts list
export function useContracts(projectId?: string) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContracts(projectId);
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const createContract = async (data: ContractCreateRequest) => {
    try {
      const newContract = await contractService.createContract(data);
      setContracts((prev) => [newContract, ...prev]);
      return newContract;
    } catch (err) {
      throw err;
    }
  };

  const updateContract = async (id: string, data: ContractUpdateRequest) => {
    try {
      const updated = await contractService.updateContract(id, data);
      setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      await contractService.deleteContract(id);
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
    createContract,
    updateContract,
    deleteContract,
  };
}

// Hook for managing single contract
export function useContract(contractId: string) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContract(contractId);
      setContract(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contract');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchContract();
    }
  }, [contractId, fetchContract]);

  return {
    contract,
    loading,
    error,
    refetch: fetchContract,
  };
}

// Hook for contract statistics
export function useContractStats(projectId?: string) {
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getContractStats(projectId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

// Hook for contract templates
export function useTemplates(type?: string) {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getTemplates(type);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
  };
}

// Hook for managing signatures
export function useSignatures(contractId: string) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getSignatures(contractId);
      setSignatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch signatures');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchSignatures();
    }
  }, [contractId, fetchSignatures]);

  const signContract = async (data: ContractSignRequest) => {
    try {
      const signature = await contractService.signContract(data);
      setSignatures((prev) =>
        prev.map((s) => (s.partyId === data.partyId ? signature : s))
      );
      return signature;
    } catch (err) {
      throw err;
    }
  };

  const rejectSignature = async (partyId: string, reason: string) => {
    try {
      const signature = await contractService.rejectSignature(contractId, partyId, reason);
      setSignatures((prev) => prev.map((s) => (s.partyId === partyId ? signature : s)));
      return signature;
    } catch (err) {
      throw err;
    }
  };

  return {
    signatures,
    loading,
    error,
    refetch: fetchSignatures,
    signContract,
    rejectSignature,
  };
}

// Hook for managing milestones
export function useMilestones(contractId: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getMilestones(contractId);
      setMilestones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchMilestones();
    }
  }, [contractId, fetchMilestones]);

  const createMilestone = async (data: MilestoneCreateRequest) => {
    try {
      const milestone = await contractService.createMilestone(data);
      setMilestones((prev) => [...prev, milestone].sort((a, b) => a.order - b.order));
      return milestone;
    } catch (err) {
      throw err;
    }
  };

  const updateMilestone = async (milestoneId: string, data: MilestoneUpdateRequest) => {
    try {
      const updated = await contractService.updateMilestone(contractId, milestoneId, data);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updated : m)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    try {
      await contractService.deleteMilestone(contractId, milestoneId);
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    } catch (err) {
      throw err;
    }
  };

  const completeMilestone = async (milestoneId: string, notes?: string) => {
    try {
      const updated = await contractService.completeMilestone(contractId, milestoneId, notes);
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updated : m)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return {
    milestones,
    loading,
    error,
    refetch: fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
  };
}

// Hook for milestone statistics
export function useMilestoneStats(contractId: string) {
  const [stats, setStats] = useState<MilestoneStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getMilestoneStats(contractId);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch milestone stats');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchStats();
    }
  }, [contractId, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

// Hook for managing contract documents
export function useContractDocuments(contractId: string) {
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getDocuments(contractId);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      fetchDocuments();
    }
  }, [contractId, fetchDocuments]);

  const deleteDocument = async (documentId: string) => {
    try {
      await contractService.deleteDocument(contractId, documentId);
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    } catch (err) {
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    deleteDocument,
  };
}
