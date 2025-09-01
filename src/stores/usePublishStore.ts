import { create } from 'zustand';
import type { PublishStatus, PublishStage, DeploymentStatus } from '@/types/publish';

interface PublishState {
  // Publishing state
  isPublishing: boolean;
  publishStatus: PublishStatus | null;
  
  // Deployment tracking
  deploymentStatus: DeploymentStatus | null;
  isTrackingDeployment: boolean;
  
  // Actions
  setPublishing: (publishing: boolean) => void;
  setPublishStatus: (status: PublishStatus) => void;
  updatePublishStage: (stage: PublishStage, message: string, progress: number, error?: string) => void;
  setDeploymentStatus: (deployment: DeploymentStatus | null) => void;
  setTrackingDeployment: (tracking: boolean) => void;
  reset: () => void;
}

const initialPublishStatus: PublishStatus = {
  stage: 'preparing',
  progress: 0,
  message: '게시 준비 중...',
};

export const usePublishStore = create<PublishState>((set, get) => ({
  // Initial state
  isPublishing: false,
  publishStatus: null,
  deploymentStatus: null,
  isTrackingDeployment: false,
  
  // Actions
  setPublishing: (publishing: boolean) => {
    set({ 
      isPublishing: publishing,
      publishStatus: publishing ? initialPublishStatus : null
    });
  },
  
  setPublishStatus: (status: PublishStatus) => {
    set({ publishStatus: status });
  },
  
  updatePublishStage: (stage: PublishStage, message: string, progress: number, error?: string) => {
    const currentStatus = get().publishStatus;
    set({
      publishStatus: {
        ...currentStatus,
        stage,
        message,
        progress,
        error,
      } as PublishStatus
    });
  },
  
  setDeploymentStatus: (deployment: DeploymentStatus | null) => {
    set({ deploymentStatus: deployment });
  },
  
  setTrackingDeployment: (tracking: boolean) => {
    set({ isTrackingDeployment: tracking });
  },
  
  reset: () => {
    set({
      isPublishing: false,
      publishStatus: null,
      deploymentStatus: null,
      isTrackingDeployment: false,
    });
  },
}));