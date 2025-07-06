/**
 * Mock implementation of Redis for testing
 */
export class RedisMock {
  private store: Map<string, string> = new Map()
  private hashStore: Map<string, Map<string, string>> = new Map()
  private ttls: Map<string, number> = new Map()

  async ping(): Promise<string> {
    return 'PONG'
  }

  async get(key: string): Promise<string | null> {
    // Check if key has expired
    const ttl = this.ttls.get(key)
    if (ttl && ttl < Date.now()) {
      this.store.delete(key)
      this.ttls.delete(key)
      return null
    }
    return this.store.get(key) || null
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, value)
    return 'OK'
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, value)
    this.ttls.set(key, Date.now() + seconds * 1000)
    return 'OK'
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key]
    let deleted = 0
    for (const k of keys) {
      if (this.store.delete(k)) deleted++
      if (this.hashStore.delete(k)) deleted++
      this.ttls.delete(k)
    }
    return deleted
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const allKeys = [...this.store.keys(), ...this.hashStore.keys()]
    return allKeys.filter((key) => regex.test(key))
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    if (!this.hashStore.has(key)) {
      this.hashStore.set(key, new Map())
    }
    const hash = this.hashStore.get(key)!
    const isNew = !hash.has(field)
    hash.set(field, value)
    return isNew ? 1 : 0
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashStore.get(key)
    return hash?.get(field) || null
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.hashStore.get(key)
    if (!hash) return {}

    const result: Record<string, string> = {}
    for (const [field, value] of hash) {
      result[field] = value
    }
    return result
  }

  async hdel(key: string, field: string): Promise<number> {
    const hash = this.hashStore.get(key)
    if (!hash) return 0
    return hash.delete(field) ? 1 : 0
  }

  async hlen(key: string): Promise<number> {
    const hash = this.hashStore.get(key)
    return hash?.size || 0
  }

  pipeline() {
    const commands: Array<() => Promise<any>> = []

    return {
      del: (key: string) => {
        commands.push(() => this.del(key))
        return this
      },
      exec: async () => {
        const results = []
        for (const cmd of commands) {
          try {
            const result = await cmd()
            results.push([null, result])
          } catch (error) {
            results.push([error, null])
          }
        }
        return results
      },
    }
  }

  async quit(): Promise<'OK'> {
    this.store.clear()
    this.hashStore.clear()
    this.ttls.clear()
    return 'OK'
  }

  // Event emitter methods for compatibility
  on() {
    return this
  }
  once() {
    return this
  }
  off() {
    return this
  }
  emit() {
    return true
  }

  // Clear all data for testing
  clear() {
    this.store.clear()
    this.hashStore.clear()
    this.ttls.clear()
  }
}
