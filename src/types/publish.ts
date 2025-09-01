import type { PostMetadata } from '@/types/github';

export interface PublishConfig {
  message: string;
  branch?: string;
  path?: string;
}

export interface PostData {
  title: string;
  content: string;
  metadata: PostMetadata;
  slug: string;
}

export type PublishStage = 
  | 'preparing' 
  | 'validating'
  | 'committing' 
  | 'pushing' 
  | 'deploying' 
  | 'completed' 
  | 'failed';

export interface PublishStatus {
  stage: PublishStage;
  progress: number; // 0-100
  message: string;
  error?: string;
  commitUrl?: string;
  deploymentUrl?: string;
}

export interface PublishWorkflow {
  postData: PostData;
  commitConfig: PublishConfig;
  status: PublishStatus;
}

export interface DeploymentStatus {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | 'action_required' | 'cancelled' | 'failure' | 'neutral' | 'skipped' | 'stale' | 'success' | 'timed_out';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
}