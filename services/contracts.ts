// Contract API Service
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
import { apiFetch } from './api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://103.200.20.100:3000';

// Contract CRUD
export const getContracts = async (projectId?: string): Promise<Contract[]> => {
  const url = projectId ? `/contracts?projectId=${projectId}` : '/contracts';
  return apiFetch(url);
};

export const getContract = async (id: string): Promise<Contract> => {
  return apiFetch(`/contracts/${id}`);
};

export const createContract = async (data: ContractCreateRequest): Promise<Contract> => {
  return apiFetch('/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateContract = async (
  id: string,
  data: ContractUpdateRequest
): Promise<Contract> => {
  return apiFetch(`/contracts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteContract = async (id: string): Promise<void> => {
  return apiFetch(`/contracts/${id}`, {
    method: 'DELETE',
  });
};

// Contract Statistics
export const getContractStats = async (projectId?: string): Promise<ContractStats> => {
  const url = projectId
    ? `/contracts/stats?projectId=${projectId}`
    : '/contracts/stats';
  return apiFetch(url);
};

// Contract Templates
export const getTemplates = async (type?: string): Promise<ContractTemplate[]> => {
  const url = type ? `/contracts/templates?type=${type}` : '/contracts/templates';
  return apiFetch(url);
};

export const getTemplate = async (id: string): Promise<ContractTemplate> => {
  return apiFetch(`/contracts/templates/${id}`);
};

export const createContractFromTemplate = async (
  templateId: string,
  data: Partial<ContractCreateRequest>
): Promise<Contract> => {
  return apiFetch(`/contracts/templates/${templateId}/create`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Signatures
export const getSignatures = async (contractId: string): Promise<Signature[]> => {
  return apiFetch(`/contracts/${contractId}/signatures`);
};

export const signContract = async (data: ContractSignRequest): Promise<Signature> => {
  return apiFetch(`/contracts/${data.contractId}/sign`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const rejectSignature = async (
  contractId: string,
  partyId: string,
  reason: string
): Promise<Signature> => {
  return apiFetch(`/contracts/${contractId}/signatures/${partyId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

// Milestones
export const getMilestones = async (contractId: string): Promise<Milestone[]> => {
  return apiFetch(`/contracts/${contractId}/milestones`);
};

export const getMilestone = async (
  contractId: string,
  milestoneId: string
): Promise<Milestone> => {
  return apiFetch(`/contracts/${contractId}/milestones/${milestoneId}`);
};

export const createMilestone = async (data: MilestoneCreateRequest): Promise<Milestone> => {
  return apiFetch(`/contracts/${data.contractId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMilestone = async (
  contractId: string,
  milestoneId: string,
  data: MilestoneUpdateRequest
): Promise<Milestone> => {
  return apiFetch(`/contracts/${contractId}/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteMilestone = async (
  contractId: string,
  milestoneId: string
): Promise<void> => {
  return apiFetch(`/contracts/${contractId}/milestones/${milestoneId}`, {
    method: 'DELETE',
  });
};

export const completeMilestone = async (
  contractId: string,
  milestoneId: string,
  notes?: string
): Promise<Milestone> => {
  return apiFetch(`/contracts/${contractId}/milestones/${milestoneId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
};

export const getMilestoneStats = async (contractId: string): Promise<MilestoneStats> => {
  return apiFetch(`/contracts/${contractId}/milestones/stats`);
};

// Documents
export const getDocuments = async (contractId: string): Promise<ContractDocument[]> => {
  return apiFetch(`/contracts/${contractId}/documents`);
};

export const uploadDocument = async (
  contractId: string,
  file: File,
  type: string
): Promise<ContractDocument> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  return apiFetch(`/contracts/${contractId}/documents`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteDocument = async (
  contractId: string,
  documentId: string
): Promise<void> => {
  return apiFetch(`/contracts/${contractId}/documents/${documentId}`, {
    method: 'DELETE',
  });
};

// PDF Generation
export const generateContractPDF = async (contractId: string): Promise<Blob> => {
  const response = await fetch(`${API_URL}/contracts/${contractId}/pdf`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }

  return response.blob();
};

export const downloadContract = async (contractId: string): Promise<void> => {
  const blob = await generateContractPDF(contractId);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contract-${contractId}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
