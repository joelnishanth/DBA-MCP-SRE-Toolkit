import React from 'react'
import { Block } from './ui/Block'
import { Button } from './ui/Button'

interface AWSCredentialsWarningProps {
  demoName: string
  onRetry?: () => void
}

const AWSCredentialsWarning: React.FC<AWSCredentialsWarningProps> = ({ demoName, onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            AWS Credentials Required
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            {demoName} requires AWS Bedrock credentials for AI-powered analysis
          </p>
        </div>

        <Block>
          <div className="text-center space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                🚫 Real AI Analysis Required
              </h2>
              <p className="text-red-700 mb-4">
                This demo showcases real AI-powered multi-agent analysis using Claude 3.5 Sonnet via Amazon Bedrock. 
                Fallback mode has been disabled to ensure you experience the full AI capabilities.
              </p>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">What you're missing:</h3>
                <ul className="text-left text-red-700 space-y-1">
                  <li>• Real-time AI analysis with Claude 3.5 Sonnet</li>
                  <li>• Dynamic confidence scoring (88-95%)</li>
                  <li>• Context-aware recommendations</li>
                  <li>• Full AI transparency (prompts & responses)</li>
                  <li>• Intelligent multi-agent orchestration</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                🛠️ Setup Instructions
              </h2>
              <div className="text-left space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">1. Configure AWS Credentials</h3>
                  <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                    <div>export AWS_ACCESS_KEY_ID=your_access_key</div>
                    <div>export AWS_SECRET_ACCESS_KEY=your_secret_key</div>
                    <div>export AWS_DEFAULT_REGION=us-east-1</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">2. Enable Amazon Bedrock</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Access Amazon Bedrock in AWS Console</li>
                    <li>• Request access to Claude 3.5 Sonnet model</li>
                    <li>• Ensure your region supports Bedrock (us-east-1, us-west-2)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">3. Restart Services</h3>
                  <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                    <div>docker restart mcp_server</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                📚 Documentation
              </h2>
              <p className="text-green-700 mb-4">
                For detailed setup instructions, see the AWS Bedrock Setup Guide:
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <code className="text-green-800 font-mono">sre-genai/AWS_BEDROCK_SETUP.md</code>
              </div>
            </div>

            {onRetry && (
              <div className="pt-4">
                <Button
                  onClick={onRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  🔄 Check Credentials Again
                </Button>
              </div>
            )}
          </div>
        </Block>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Once configured, you'll experience the full power of AI-driven {demoName.toLowerCase()} 
            with real-time multi-agent analysis and intelligent recommendations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AWSCredentialsWarning