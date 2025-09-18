import React from 'react'
import MermaidDiagram from './MermaidDiagram'

const TestDiagram: React.FC = () => {
  const simpleChart = `
graph TD
    A[Start] --> B[Process]
    B --> C[End]
  `

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Mermaid Test</h2>
      <MermaidDiagram chart={simpleChart} />
    </div>
  )
}

export default TestDiagram