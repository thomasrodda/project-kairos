import { BaseApiClient } from './client'

interface Workspace {
  id: string
  name: string
  userId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface WorkspacesResponse {
  workspaces: Workspace[]
}

interface WorkspaceResponse {
  workspace: Workspace
}

interface CreateWorkspaceResponse extends Workspace {
  defaultPageId: string
}

class WorkspaceService extends BaseApiClient {
  async getWorkspaces() {
    return this.request<WorkspacesResponse>('/workspaces')
  }

  async getWorkspace(id: string) {
    return this.request<WorkspaceResponse>(`/workspaces?id=${id}`)
  }

  async createWorkspace(data: { name: string }) {
    return this.request<CreateWorkspaceResponse>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWorkspace(id: string, data: { name: string }) {
    return this.request<WorkspaceResponse>(`/workspaces?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteWorkspace(id: string) {
    return this.request<{ success: boolean }>(`/workspaces?id=${id}`, {
      method: 'DELETE',
    })
  }
}

export const workspaceService = new WorkspaceService()
