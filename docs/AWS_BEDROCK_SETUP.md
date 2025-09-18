# AWS Bedrock Setup for Real Claude AI Integration

## Overview
This guide shows how to configure AWS Bedrock with Claude 3.5 Sonnet for real AI-powered database analysis in the DBA provisioning workflows.

## Prerequisites

### 1. AWS Account Setup
- AWS account with Bedrock access
- IAM user/role with Bedrock permissions
- Claude 3.5 Sonnet model access enabled

### 2. Required AWS Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
            ]
        }
    ]
}
```

## Configuration Steps

### Step 1: Enable Claude 3.0 Haiku in Bedrock
1. **Open AWS Console** → **Bedrock** → **Model Access**
2. **Request Access** to `anthropic.claude-3-haiku-20240307-v1:0`
3. **Wait for approval** (usually immediate for most regions)

### Step 2: Configure AWS Credentials

#### Option A: Environment Variables (Recommended for Development)
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Option B: AWS Credentials File
```bash
# ~/.aws/credentials
[default]
aws_access_key_id = your_access_key
aws_secret_access_key = your_secret_key

# ~/.aws/config
[default]
region = us-east-1
```

#### Option C: Docker Environment Variables
```yaml
# In docker-compose.yml
services:
  mcp_server:
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_DEFAULT_REGION=us-east-1
```

### Step 3: Test Bedrock Connection

#### Test via MCP Server Endpoint
```bash
# Test Bedrock connection
curl -s "http://localhost:5001/ai/bedrock/test"

# Check Bedrock status
curl -s "http://localhost:5001/ai/bedrock/status"
```

#### Expected Success Response
```json
{
  "status": "success",
  "message": "Bedrock connection successful",
  "configured": true,
  "model_id": "anthropic.claude-3-haiku-20240307-v1:0",
  "region": "us-east-1",
  "response": "Connection successful"
}
```

### Step 4: Test Real AI Analysis

#### Test Database Analysis
```bash
curl -X POST "http://localhost:5001/ai/analyze-database" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "ecommerce",
    "team": "E-commerce Platform",
    "application": "RetailHub",
    "requirements": {
      "data_type": "product_catalog_inventory",
      "expected_records": "2M products, 500K daily transactions",
      "compliance": ["PCI-DSS", "SOX"],
      "performance_requirements": {
        "max_query_response": "100ms",
        "concurrent_connections": 1000
      }
    }
  }'
```

#### Expected AI Response
```json
{
  "success": true,
  "ai_provider": "AWS Bedrock Claude 3.0 Haiku",
  "model_id": "anthropic.claude-3-haiku-20240307-v1:0",
  "recommendation": {
    "primary_solution": "Amazon Aurora PostgreSQL",
    "instance_type": "db.r6g.2xlarge",
    "estimated_monthly_cost": 2847
  },
  "analysis": {
    "confidence_score": 0.92,
    "reasoning": [
      "High read/write performance with Aurora's distributed architecture",
      "Built-in compliance features for PCI-DSS and SOX",
      "Multi-region replication for geographic distribution"
    ]
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "AWS credentials not found"
**Solution**: Configure AWS credentials using one of the methods above

#### 2. "Access denied to model"
**Solution**: 
- Check model access in Bedrock console
- Verify IAM permissions include `bedrock:InvokeModel`
- Ensure you're using the correct model ID: `anthropic.claude-3-haiku-20240307-v1:0`

#### 3. "Region not supported"
**Solution**: 
- Use supported regions: `us-east-1`, `us-west-2`, `eu-west-1`
- Update region in credentials and Bedrock client

#### 4. "Model not available"
**Solution**:
- Request access to Claude 3.0 Haiku in Bedrock console
- Wait for approval (usually immediate)

### Fallback Behavior

If Bedrock is not configured or fails:
- **Fallback Analysis**: System provides reasonable default recommendations
- **Error Logging**: Detailed error messages in MCP server logs
- **Graceful Degradation**: Workflows continue with fallback data

## Cost Considerations

### Bedrock Pricing (us-east-1)
- **Input Tokens**: $0.003 per 1K tokens
- **Output Tokens**: $0.015 per 1K tokens
- **Typical Analysis**: ~2K input + 1K output = ~$0.021 per analysis

### Monthly Estimates
- **10 analyses/day**: ~$6.30/month
- **50 analyses/day**: ~$31.50/month
- **100 analyses/day**: ~$63/month

## Production Recommendations

### Security
- Use IAM roles instead of access keys in production
- Implement least-privilege permissions
- Enable CloudTrail logging for Bedrock API calls

### Performance
- Consider caching analysis results for similar requests
- Implement retry logic with exponential backoff
- Monitor token usage and costs

### Monitoring
- Set up CloudWatch alarms for Bedrock usage
- Monitor analysis success/failure rates
- Track cost per analysis

## Integration with n8n Workflows

The n8n workflows have been updated to call AWS Bedrock directly for improved performance:

### Direct Bedrock Integration
1. **Receive database requests** via webhooks
2. **Call AWS Bedrock directly** using n8n AWS credentials
3. **Get structured recommendations** with confidence scores and cost analysis
4. **Display results** in n8n Updates page with real AI insights
5. **Proceed to DBA approval** with actual AI recommendations

### Configuration Required
- **AWS Credentials**: Configure in n8n Settings → Credentials → AWS
- **Model Access**: Ensure Claude 3.0 Haiku access in Bedrock console
- **IAM Permissions**: `bedrock:InvokeModel` permission required

See `n8n/AWS_CREDENTIALS_SETUP.md` for detailed setup instructions.

### Benefits
- **Better Performance**: Direct API calls eliminate MCP server latency
- **Lower Cost**: Claude 3.0 Haiku is more cost-effective
- **Higher Reliability**: Fewer components in the integration chain
- **AWS Native**: Leverages AWS security and scaling capabilities

The workflows include robust error handling and fallback logic to ensure reliability even if Bedrock is temporarily unavailable.