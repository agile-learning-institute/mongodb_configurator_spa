export interface ConfiguratorEvent {
  id: string
  type: string
  status: 'PENDING' | 'SUCCESS' | 'FAILURE'
  data?: Record<string, any> | null
  starts: string // ISO date-time
  ends?: string | null // ISO date-time, null if still pending
  sub_events?: ConfiguratorEvent[]
}

export interface ConfiguratorEvents {
  events: ConfiguratorEvent[]
} 