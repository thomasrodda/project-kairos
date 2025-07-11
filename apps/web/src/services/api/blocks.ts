import { BaseApiClient } from './client'

interface Block {
  id: string
  type: string
  content: string
  order: number
  metadata: Record<string, unknown> | null
  pageId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface BlocksResponse {
  blocks: Block[]
}

interface BlockResponse {
  block: Block
}

interface CreateBlockData {
  type: string
  content: string
  order: number
  metadata?: Record<string, unknown>
}

interface UpdateBlockData {
  type?: string
  content?: string
  metadata?: Record<string, unknown>
}

interface BulkUpdateData {
  id: string
  type?: string
  content?: string
  metadata?: Record<string, unknown>
}

class BlockService extends BaseApiClient {
  async getBlocks(pageId: string) {
    return this.request<BlocksResponse>(`/blocks?pageId=${pageId}`)
  }

  async getBlock(id: string) {
    return this.request<BlockResponse>(`/blocks?id=${id}`)
  }

  async createBlock(pageId: string, data: CreateBlockData) {
    return this.request<BlockResponse>(`/blocks?pageId=${pageId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBlock(id: string, data: UpdateBlockData) {
    return this.request<BlockResponse>(`/blocks?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateBlocksBulk(blocks: BulkUpdateData[]) {
    return this.request<BlocksResponse>('/blocks/bulk', {
      method: 'PUT',
      body: JSON.stringify({ blocks }),
    })
  }

  async deleteBlock(id: string) {
    return this.request<{ success: boolean }>(`/blocks?id=${id}`, {
      method: 'DELETE',
    })
  }

  async reorderBlocks(data: { blockId: string; newOrder: number }[]) {
    return this.request<{ success: boolean }>('/blocks/reorder', {
      method: 'PUT',
      body: JSON.stringify({ blocks: data }),
    })
  }
}

export const blockService = new BlockService()
