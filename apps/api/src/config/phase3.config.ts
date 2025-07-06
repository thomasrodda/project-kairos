/**
 * Centralized configuration for Phase 3 services
 * All values can be overridden via environment variables
 */

export interface Phase3Config {
  history: {
    snapshotThreshold: number
    snapshotIntervalHours: number
    retentionDays: number
    queryLimit: {
      min: number
      max: number
      default: number
    }
  }
  search: {
    queryMaxLength: number
    resultLimit: {
      min: number
      max: number
      default: number
    }
    suggestionLimit: number
    contextLength: number
    contextPreview: number
  }
  export: {
    maxExportSizeMB: number
    maxRecursionDepth: number
    markdownOptions: {
      includeMetadata: boolean
      includeSubpages: boolean
    }
  }
  sync: {
    activeEditTTL: number
    staleEditThreshold: number
    cleanupIntervalMinutes: number
  }
  websocket: {
    cors: {
      origins: string[]
    }
    connection: {
      pingTimeout: number
      pingInterval: number
    }
    rateLimits: {
      eventsPerMinute: number
      broadcastsPerMinute: number
    }
  }
}

export const phase3Config: Phase3Config = {
  // History Service Configuration
  history: {
    // Create snapshot every N changes
    snapshotThreshold: parseInt(process.env.HISTORY_SNAPSHOT_THRESHOLD || '100'),
    // Create snapshot every N hours
    snapshotIntervalHours: parseInt(process.env.HISTORY_SNAPSHOT_INTERVAL_HOURS || '24'),
    // Keep history for N days (free tier default)
    retentionDays: parseInt(process.env.HISTORY_RETENTION_DAYS || '30'),
    queryLimit: {
      min: 1,
      max: parseInt(process.env.HISTORY_QUERY_LIMIT_MAX || '100'),
      default: parseInt(process.env.HISTORY_QUERY_LIMIT_DEFAULT || '50'),
    },
  },

  // Search Service Configuration
  search: {
    // Maximum query string length
    queryMaxLength: parseInt(process.env.SEARCH_QUERY_MAX_LENGTH || '200'),
    resultLimit: {
      min: 1,
      max: parseInt(process.env.SEARCH_RESULT_LIMIT_MAX || '100'),
      default: parseInt(process.env.SEARCH_RESULT_LIMIT_DEFAULT || '20'),
    },
    // Number of suggestions to return
    suggestionLimit: parseInt(process.env.SEARCH_SUGGESTION_LIMIT || '5'),
    // Context length for search result snippets
    contextLength: parseInt(process.env.SEARCH_CONTEXT_LENGTH || '200'),
    // Preview context around first match
    contextPreview: parseInt(process.env.SEARCH_CONTEXT_PREVIEW || '50'),
  },

  // Export Service Configuration
  export: {
    // Maximum export size in MB
    maxExportSizeMB: parseInt(process.env.EXPORT_MAX_SIZE_MB || '50'),
    // Maximum depth for recursive subpage exports
    maxRecursionDepth: parseInt(process.env.EXPORT_MAX_RECURSION_DEPTH || '10'),
    markdownOptions: {
      includeMetadata: process.env.EXPORT_INCLUDE_METADATA === 'true',
      includeSubpages: process.env.EXPORT_INCLUDE_SUBPAGES !== 'false', // Default true
    },
  },

  // Sync Service Configuration
  sync: {
    // TTL for active edits in seconds
    activeEditTTL: parseInt(process.env.SYNC_ACTIVE_EDIT_TTL || '30'),
    // Threshold for considering edits as stale (seconds)
    staleEditThreshold: parseInt(process.env.SYNC_STALE_EDIT_THRESHOLD || '60'),
    // Cleanup interval in minutes
    cleanupIntervalMinutes: parseInt(process.env.SYNC_CLEANUP_INTERVAL_MINUTES || '5'),
  },

  // WebSocket Configuration
  websocket: {
    cors: {
      origins: process.env.WEBSOCKET_CORS_ORIGINS
        ? process.env.WEBSOCKET_CORS_ORIGINS.split(',')
        : [process.env.VITE_API_URL || 'http://localhost:3000'],
    },
    connection: {
      // Ping timeout in milliseconds
      pingTimeout: parseInt(process.env.WEBSOCKET_PING_TIMEOUT || '60000'),
      // Ping interval in milliseconds
      pingInterval: parseInt(process.env.WEBSOCKET_PING_INTERVAL || '25000'),
    },
    rateLimits: {
      // Maximum events per minute per socket
      eventsPerMinute: parseInt(process.env.WEBSOCKET_EVENTS_PER_MINUTE || '120'),
      // Maximum broadcasts per minute per socket
      broadcastsPerMinute: parseInt(process.env.WEBSOCKET_BROADCASTS_PER_MINUTE || '60'),
    },
  },
}

// Validation function to ensure config values are reasonable
export function validatePhase3Config(config: Phase3Config): void {
  // History validation
  if (config.history.snapshotThreshold < 1) {
    throw new Error('HISTORY_SNAPSHOT_THRESHOLD must be at least 1')
  }
  if (config.history.snapshotIntervalHours < 1) {
    throw new Error('HISTORY_SNAPSHOT_INTERVAL_HOURS must be at least 1')
  }
  if (config.history.retentionDays < 1) {
    throw new Error('HISTORY_RETENTION_DAYS must be at least 1')
  }

  // Search validation
  if (config.search.queryMaxLength < 1) {
    throw new Error('SEARCH_QUERY_MAX_LENGTH must be at least 1')
  }
  if (config.search.resultLimit.max < config.search.resultLimit.min) {
    throw new Error('SEARCH_RESULT_LIMIT_MAX must be >= SEARCH_RESULT_LIMIT_MIN')
  }

  // Export validation
  if (config.export.maxExportSizeMB < 1) {
    throw new Error('EXPORT_MAX_SIZE_MB must be at least 1')
  }
  if (config.export.maxRecursionDepth < 1) {
    throw new Error('EXPORT_MAX_RECURSION_DEPTH must be at least 1')
  }

  // Sync validation
  if (config.sync.activeEditTTL < 1) {
    throw new Error('SYNC_ACTIVE_EDIT_TTL must be at least 1')
  }

  // WebSocket validation
  if (config.websocket.connection.pingTimeout < 1000) {
    throw new Error('WEBSOCKET_PING_TIMEOUT must be at least 1000ms')
  }
  if (config.websocket.connection.pingInterval < 1000) {
    throw new Error('WEBSOCKET_PING_INTERVAL must be at least 1000ms')
  }
}

// Validate config on startup
if (process.env.NODE_ENV !== 'test') {
  try {
    validatePhase3Config(phase3Config)
  } catch (error) {
    console.error('Invalid Phase 3 configuration:', error)
    process.exit(1)
  }
}
