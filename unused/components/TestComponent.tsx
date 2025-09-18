import React, { useEffect } from 'react'

const TestComponent: React.FC = () => {
  useEffect(() => {
    console.log('TestComponent mounted successfully')
    return () => {
      console.log('TestComponent unmounting')
    }
  }, [])

  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Test Component - React is Working!
      </h1>
      <p className="text-gray-600">
        If you can see this, React is rendering properly.
      </p>
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800">
          ✅ Component mounted at: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export default TestComponent