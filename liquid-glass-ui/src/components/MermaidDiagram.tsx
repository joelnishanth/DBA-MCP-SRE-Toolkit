import React, { useEffect, useRef, useState, useMemo } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  id?: string
  className?: string
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = React.memo(({ 
  chart, 
  id,
  className = ""
}) => {
  // Generate stable ID that doesn't change on re-renders
  const stableId = useMemo(() => 
    id || `mermaid-${Math.random().toString(36).substring(2, 9)}`, 
    [id]
  )
  const elementRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastChart, setLastChart] = useState<string>('')

  // Memoize the trimmed chart to prevent unnecessary re-renders
  const trimmedChart = useMemo(() => chart.trim(), [chart])

  useEffect(() => {
    // Skip if chart hasn't actually changed
    if (trimmedChart === lastChart && svgContent) {
      return
    }

    let isMounted = true
    let renderTimeout: NodeJS.Timeout

    const initializeMermaid = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize Mermaid only once
        if (!mermaid.mermaidAPI) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: false,
              curve: 'basis'
            },
            sequence: {
              useMaxWidth: true
            }
          })
        }

        if (trimmedChart && isMounted) {
          try {
            // Clear any existing render timeout
            if (renderTimeout) {
              clearTimeout(renderTimeout)
            }

            // Add a longer delay for flowchart diagrams to prevent flashing
            const isFlowchart = trimmedChart.includes('graph ')
            const delay = isFlowchart ? 300 : 100

            renderTimeout = setTimeout(async () => {
              if (!isMounted) return

              try {
                // Render the diagram to SVG string
                const { svg } = await mermaid.render(stableId, trimmedChart)
                
                if (isMounted) {
                  setSvgContent(svg)
                  setLastChart(trimmedChart)
                  setIsLoading(false)
                }
              } catch (renderError) {
                console.error('Mermaid render error:', renderError)
                if (isMounted) {
                  setError(renderError instanceof Error ? renderError.message : 'Failed to render diagram')
                  setIsLoading(false)
                }
              }
            }, delay)
          } catch (err) {
            console.error('Mermaid setup error:', err)
            if (isMounted) {
              setError(err instanceof Error ? err.message : 'Failed to setup diagram')
              setIsLoading(false)
            }
          }
        }
      } catch (err) {
        console.error('Mermaid initialization error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize Mermaid')
          setIsLoading(false)
        }
      }
    }

    initializeMermaid()

    return () => {
      isMounted = false
      if (renderTimeout) {
        clearTimeout(renderTimeout)
      }
    }
  }, [trimmedChart, stableId, lastChart, svgContent])

  if (isLoading) {
    return (
      <div 
        className={`mermaid-diagram ${className}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          padding: '20px',
          width: '100%'
        }}
      >
        <div className="flex items-center justify-center text-gray-500 text-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
          Loading diagram...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className={`mermaid-diagram ${className}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          padding: '20px',
          width: '100%'
        }}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <div className="text-red-600 text-lg font-semibold mb-2">Diagram Error</div>
          <div className="text-red-500 text-sm mb-4">{error}</div>
          <div className="text-gray-600 text-xs">
            Please check the diagram syntax or try refreshing the page.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={elementRef}
      className={`mermaid-diagram ${className}`}
      style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        padding: '20px',
        width: '100%'
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
})

// Add display name for debugging
MermaidDiagram.displayName = 'MermaidDiagram'

export default MermaidDiagram