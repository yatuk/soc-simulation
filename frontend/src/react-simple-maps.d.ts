declare module 'react-simple-maps' {
  import type { ComponentType, ReactNode } from 'react'

  interface GeographyType {
    rsmKey: string
    properties?: Record<string, unknown>
  }

  interface MarkerProps {
    coordinates: [number, number]
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string
    children: (args: { geographies: GeographyType[] }) => ReactNode
  }

  interface GeographyProps {
    geography: GeographyType
    key?: string
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    style?: {
      default?: Record<string, unknown>
      hover?: Record<string, unknown>
      pressed?: Record<string, unknown>
    }
  }

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, number>
    width?: number
    height?: number
    style?: Record<string, string>
    children?: ReactNode
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
  export const Marker: ComponentType<MarkerProps>
}
