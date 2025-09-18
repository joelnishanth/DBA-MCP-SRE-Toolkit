#!/bin/bash

echo "🚀 Quick Workflow Test - Simulating Database Request"
echo "=================================================="
echo ""

# First, let's simulate what would happen when a workflow executes
echo "1. Simulating E-commerce Database Request Workflow..."

# Simulate the workflow execution by posting updates that would come from n8n
echo "   📝 Step 1: Request received and validated..."
curl -s -X POST "http://localhost:5001/n8n/update" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_name": "DBA E-commerce Database Provisioning",
    "alert_type": "system_notification",
    "message": "🛒 Database request received from E-commerce Platform team for RetailHub application",
    "severity": "medium",
    "details": {
      "team": "E-commerce Platform",
      "application": "RetailHub", 
      "requirements": "2M products, 500K daily transactions, PCI-DSS compliance",
      "step": "request_validation"
    }
  }' > /dev/null

sleep 2

echo "   🤖 Step 2: Claude AI analyzing requirements..."
curl -s -X POST "http://localhost:5001/n8n/update" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_name": "DBA E-commerce Database Provisioning", 
    "alert_type": "workflow_execution",
    "message": "🧠 Claude AI recommends Aurora PostgreSQL with 92% confidence for high-traffic e-commerce workload",
    "severity": "low",
    "details": {
      "ai_recommendation": "Aurora PostgreSQL",
      "confidence": "92%",
      "estimated_cost": "$2,847/month",
      "reasoning": "Optimized for high-traffic, PCI-DSS compliant, multi-region support",
      "step": "ai_analysis_complete"
    }
  }' > /dev/null

sleep 2

echo "   👨‍💼 Step 3: Sending to DBA for approval..."
curl -s -X POST "http://localhost:5001/n8n/update" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_name": "DBA E-commerce Database Provisioning",
    "alert_type": "system_notification", 
    "message": "⏳ Database request awaiting DBA approval - Aurora PostgreSQL recommended for $2,847/month",
    "severity": "high",
    "details": {
      "status": "pending_approval",
      "recommendation": "Aurora PostgreSQL with multi-region setup",
      "cost_analysis": "Within budget guidelines",
      "compliance": "PCI-DSS ✅, SOX ✅",
      "step": "dba_approval_required"
    }
  }' > /dev/null

sleep 2

echo "   ✅ Step 4: Simulating DBA approval and AWS provisioning..."
curl -s -X POST "http://localhost:5001/n8n/update" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_name": "DBA E-commerce Database Provisioning",
    "alert_type": "system_notification",
    "message": "🎉 SUCCESS! Aurora PostgreSQL cluster provisioned for E-commerce Platform team",
    "severity": "low", 
    "details": {
      "status": "provisioning_complete",
      "cluster_id": "aurora-ecommerce-prod",
      "endpoint": "aurora-ecommerce-prod.cluster-xyz.us-east-1.rds.amazonaws.com",
      "cost": "$2,847/month",
      "completion_time": "18 minutes",
      "step": "provisioning_complete"
    }
  }' > /dev/null

echo ""
echo "✅ Workflow simulation complete!"
echo ""
echo "🔍 View the results:"
echo "   • n8n Updates Page: http://localhost:3000/n8n-updates"
echo "   • n8n Workflows Page: http://localhost:3000/n8n-workflows"
echo ""
echo "📊 You should see 4 updates showing the complete workflow:"
echo "   1. Request received and validated"
echo "   2. Claude AI analysis complete"  
echo "   3. DBA approval required"
echo "   4. AWS provisioning complete"