import { GitHubApiService } from './github-api';
import type { DeploymentStatus } from '@/types/publish';

export class GitHubActionsService {
  constructor(private apiService: GitHubApiService) {}

  /**
   * Get workflow runs for a repository
   */
  async getWorkflowRuns(
    owner: string,
    repo: string,
    workflowId?: string,
    branch?: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const params: any = {
        per_page: limit,
        page: 1,
      };

      if (branch) {
        params.branch = branch;
      }

      let endpoint = `repos/${owner}/${repo}/actions/runs`;
      if (workflowId) {
        endpoint = `repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`;
      }

      const response = await this.apiService['octokit']!.request(`GET /${endpoint}`, params);
      return response.data.workflow_runs || [];
    } catch (error) {
      console.error('Failed to get workflow runs:', error);
      return [];
    }
  }

  /**
   * Get latest deployment run for a specific commit
   */
  async getLatestDeploymentRun(
    owner: string,
    repo: string,
    sha: string
  ): Promise<DeploymentStatus | null> {
    try {
      // Get runs for the specific commit
      const response = await this.apiService['octokit']!.request(
        'GET /repos/{owner}/{repo}/actions/runs',
        {
          owner,
          repo,
          head_sha: sha,
          per_page: 5,
        }
      );

      const runs = response.data.workflow_runs || [];
      
      // Find deployment-related workflow (common names: deploy, build-and-deploy, pages-build-deployment)
      const deploymentRun = runs.find(run => 
        run.name?.toLowerCase().includes('deploy') ||
        run.name?.toLowerCase().includes('pages') ||
        run.name?.toLowerCase().includes('build')
      );

      if (!deploymentRun) {
        return null;
      }

      return {
        id: deploymentRun.id,
        status: this.mapWorkflowStatus(deploymentRun.status),
        conclusion: deploymentRun.conclusion as DeploymentStatus['conclusion'],
        htmlUrl: deploymentRun.html_url,
        createdAt: deploymentRun.created_at,
        updatedAt: deploymentRun.updated_at,
      };

    } catch (error) {
      console.error('Failed to get deployment run:', error);
      return null;
    }
  }

  /**
   * Poll deployment status until completion or timeout
   */
  async pollDeploymentStatus(
    owner: string,
    repo: string,
    sha: string,
    onUpdate: (status: DeploymentStatus) => void,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<DeploymentStatus | null> {
    const startTime = Date.now();
    const pollInterval = 10000; // 10 seconds

    const poll = async (): Promise<DeploymentStatus | null> => {
      if (Date.now() - startTime > timeoutMs) {
        console.warn('Deployment polling timed out');
        return null;
      }

      const status = await this.getLatestDeploymentRun(owner, repo, sha);
      
      if (status) {
        onUpdate(status);
        
        // Continue polling if still in progress
        if (status.status === 'in_progress' || status.status === 'queued') {
          setTimeout(poll, pollInterval);
          return null;
        }
        
        return status;
      }

      // Retry if no status found yet (deployment might not have started)
      setTimeout(poll, pollInterval);
      return null;
    };

    return poll();
  }

  /**
   * Get specific workflow run by ID
   */
  async getWorkflowRun(
    owner: string,
    repo: string,
    runId: number
  ): Promise<any | null> {
    try {
      const response = await this.apiService['octokit']!.request(
        'GET /repos/{owner}/{repo}/actions/runs/{run_id}',
        {
          owner,
          repo,
          run_id: runId,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get workflow run:', error);
      return null;
    }
  }

  /**
   * Map GitHub workflow status to our deployment status
   */
  private mapWorkflowStatus(githubStatus: string): DeploymentStatus['status'] {
    switch (githubStatus) {
      case 'queued':
      case 'requested':
      case 'waiting':
        return 'queued';
      case 'in_progress':
      case 'running':
        return 'in_progress';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'queued';
    }
  }

  /**
   * Get deployments for a repository
   */
  async getDeployments(
    owner: string,
    repo: string,
    environment?: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const params: any = {
        per_page: limit,
      };

      if (environment) {
        params.environment = environment;
      }

      const response = await this.apiService['octokit']!.request(
        'GET /repos/{owner}/{repo}/deployments',
        {
          owner,
          repo,
          ...params,
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Failed to get deployments:', error);
      return [];
    }
  }

  /**
   * Get deployment statuses
   */
  async getDeploymentStatuses(
    owner: string,
    repo: string,
    deploymentId: number
  ): Promise<any[]> {
    try {
      const response = await this.apiService['octokit']!.request(
        'GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses',
        {
          owner,
          repo,
          deployment_id: deploymentId,
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Failed to get deployment statuses:', error);
      return [];
    }
  }
}