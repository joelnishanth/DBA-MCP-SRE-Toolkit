import React, { useState, useEffect, useRef } from 'react';
import LiquidGlassCard from '../components/LiquidGlassCard';
import MermaidDiagram from '../components/MermaidDiagram';
import AIAssistant from '../components/AIAssistant';

interface AWSResource {
  id: string;
  type: 'EC2' | 'RDS' | 'S3';
  name: string;
  region: string;
  application: string;
  team: string;
  environment: string;
  cost_monthly: number;
  tags: Record<string, string>;
  status: string;
  created_date: string;
  specifications?: {
    instance_type?: string;
    vcpu?: number;
    memory_gb?: number;
    storage_gb?: number;
    engine?: string;
    engine_version?: string;
    bucket_size_gb?: number;
    // RDS specific fields
    multi_az?: boolean;
    encrypted?: boolean;
    backup_retention_period?: number;
    publicly_accessible?: boolean;
    storage_type?: string;
    iops?: number;
    read_replicas?: string[];
    maintenance_window?: string;
    backup_window?: string;
    parameter_group?: string;
    subnet_group?: string;
    security_groups?: string[];
  };
}

interface ProjectSummary {
  project: string;
  team: string;
  total_cost: number;
  resource_count: number;
  resources: {
    ec2: number;
    rds: number;
    s3: number;
  };
  environments: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AWSInventory: React.FC = () => {
  const [resources, setResources] = useState<AWSResource[]>([]);
  const [projectSummaries, setProjectSummaries] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'resources' | 'chat'>('overview');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const demoQueries = [
    { label: '🗄️ Database Engine Analysis', query: 'Show me all RDS instances grouped by engine type (MySQL, PostgreSQL, Oracle) with their versions and costs' },
    { label: '⚠️ Database Compliance Check', query: 'Which RDS databases are running outdated engine versions and need upgrades?' },
    { label: '💾 Storage Utilization Review', query: 'Analyze RDS storage allocation vs actual usage and identify over-provisioned databases' },
    { label: '🔒 Security Assessment', query: 'List all RDS instances without encryption at rest and those in public subnets' },
    { label: '📈 Performance Tier Analysis', query: 'Show RDS instances by performance class (t3, m5, r5) and recommend right-sizing opportunities' },
    { label: '🔄 Backup & Maintenance Status', query: 'Review backup retention settings and maintenance windows across all RDS instances' },
    { label: '💰 Database Cost Optimization', query: 'Identify the most expensive RDS instances and suggest Reserved Instance opportunities' },
    { label: '🌐 Multi-AZ & Read Replica Setup', query: 'Show which production databases lack Multi-AZ deployment or read replicas for high availability' }
  ];

  useEffect(() => {
    fetchAWSData();
  }, []);

  // Auto-scroll to bottom when chat messages change
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchAWSData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from AWS inventory service
      const [ec2Response, rdsResponse, s3Response] = await Promise.all([
        fetch('http://localhost:5002/api/v1/inventory/ec2'),
        fetch('http://localhost:5002/api/v1/inventory/rds'),
        fetch('http://localhost:5002/api/v1/inventory/s3') // This endpoint needs to be created
      ]);

      const ec2Data = await ec2Response.json();
      const rdsData = await rdsResponse.json();
      
      // Transform EC2 data
      const ec2Resources: AWSResource[] = ec2Data.instances?.map((instance: any) => ({
        id: instance.instance_id,
        type: 'EC2' as const,
        name: instance.instance_id,
        region: instance.region,
        application: instance.application,
        team: instance.team,
        environment: instance.environment,
        cost_monthly: instance.cost_breakdown?.total_monthly_cost || 0,
        tags: instance.tags || {},
        status: instance.state,
        created_date: instance.launch_time,
        specifications: {
          instance_type: instance.instance_type,
          vcpu: instance.specifications?.vcpu,
          memory_gb: instance.specifications?.memory_gb,
          storage_gb: instance.specifications?.storage_gb
        }
      })) || [];

      // Transform RDS data or generate realistic synthetic data
      let rdsResources: AWSResource[] = [];
      if (rdsData.instances && rdsData.instances.length > 0) {
        rdsResources = rdsData.instances.map((instance: any) => ({
          id: instance.db_instance_identifier,
          type: 'RDS' as const,
          name: instance.db_instance_identifier,
          region: instance.region,
          application: instance.application,
          team: instance.team,
          environment: instance.environment,
          cost_monthly: instance.cost_breakdown?.total_monthly_cost || 0,
          tags: instance.tags || {},
          status: instance.db_status,
          created_date: instance.creation_time,
          specifications: {
            instance_type: instance.db_instance_class,
            vcpu: instance.specifications?.vcpu,
            memory_gb: instance.specifications?.memory_gb,
            storage_gb: instance.specifications?.allocated_storage_gb,
            engine: instance.engine,
            engine_version: instance.engine_version,
            multi_az: instance.multi_az,
            encrypted: instance.storage_encrypted,
            backup_retention_period: instance.backup_retention_period,
            publicly_accessible: instance.publicly_accessible,
            storage_type: instance.storage_type,
            iops: instance.iops,
            read_replicas: instance.read_replica_db_instance_identifiers || [],
            maintenance_window: instance.preferred_maintenance_window,
            backup_window: instance.preferred_backup_window,
            parameter_group: instance.db_parameter_groups?.[0]?.db_parameter_group_name,
            subnet_group: instance.db_subnet_group?.db_subnet_group_name,
            security_groups: instance.vpc_security_groups?.map((sg: any) => sg.vpc_security_group_id) || []
          }
        }));
      } else {
        // Generate realistic RDS synthetic data
        rdsResources = generateRealisticRDSData();
      }

      // Generate synthetic S3 data for demo
      const s3Resources: AWSResource[] = generateS3Data();

      const allResources = [...ec2Resources, ...rdsResources, ...s3Resources];
      setResources(allResources);

      // Generate project summaries
      const summaries = generateProjectSummaries(allResources);
      setProjectSummaries(summaries);

    } catch (error) {
      console.error('Error fetching AWS data:', error);
      // Generate synthetic data as fallback
      const syntheticData = generateSyntheticAWSData();
      setResources(syntheticData);
      setProjectSummaries(generateProjectSummaries(syntheticData));
    } finally {
      setLoading(false);
    }
  };

  const generateRealisticRDSData = (): AWSResource[] => {
    const engines = [
      { name: 'mysql', versions: ['8.0.35', '8.0.33', '5.7.44'] },
      { name: 'postgres', versions: ['15.4', '14.9', '13.13', '12.17'] },
      { name: 'oracle-ee', versions: ['19.0.0.0.ru-2023-10.rur-2023-10.r1'] },
      { name: 'sqlserver-ex', versions: ['15.00.4335.1.v1', '14.00.3451.2.v1'] },
      { name: 'mariadb', versions: ['10.11.5', '10.6.14'] }
    ];
    
    const instanceClasses = [
      { type: 'db.t3.micro', vcpu: 2, memory: 1, cost_base: 15 },
      { type: 'db.t3.small', vcpu: 2, memory: 2, cost_base: 30 },
      { type: 'db.t3.medium', vcpu: 2, memory: 4, cost_base: 60 },
      { type: 'db.m5.large', vcpu: 2, memory: 8, cost_base: 120 },
      { type: 'db.m5.xlarge', vcpu: 4, memory: 16, cost_base: 240 },
      { type: 'db.m5.2xlarge', vcpu: 8, memory: 32, cost_base: 480 },
      { type: 'db.r5.large', vcpu: 2, memory: 16, cost_base: 150 },
      { type: 'db.r5.xlarge', vcpu: 4, memory: 32, cost_base: 300 }
    ];

    const applications = ["UserAuth", "PaymentProcessor", "OrderManagement", "InventorySystem", "RecommendationEngine", "LoggingService", "AnalyticsEngine", "NotificationService"];
    const teams = ["Platform", "Commerce", "Analytics", "Infrastructure", "Security", "DevOps"];
    const regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];
    const environments = ["production", "staging", "development", "testing"];

    return Array.from({ length: 35 }, (_, i) => {
      const engine = engines[i % engines.length];
      const instanceClass = instanceClasses[i % instanceClasses.length];
      const app = applications[i % applications.length];
      const team = teams[i % teams.length];
      const region = regions[i % regions.length];
      const env = environments[i % environments.length];
      const isProduction = env === 'production';
      const multiAz = isProduction && Math.random() > 0.3;
      const encrypted = isProduction || Math.random() > 0.4;
      const storageSize = [20, 50, 100, 200, 500, 1000][Math.floor(Math.random() * 6)];
      const storageType = storageSize > 100 ? (Math.random() > 0.5 ? 'gp3' : 'io1') : 'gp2';
      
      return {
        id: `${app.toLowerCase()}-${env}-db-${i + 1}`,
        type: 'RDS' as const,
        name: `${app.toLowerCase()}-${env}-db-${i + 1}`,
        region,
        application: app,
        team,
        environment: env,
        cost_monthly: Math.round(instanceClass.cost_base * (multiAz ? 2 : 1) * (storageSize / 100) * (encrypted ? 1.1 : 1)),
        tags: {
          Application: app,
          Team: team,
          Environment: env,
          Engine: engine.name,
          BackupRequired: isProduction ? 'true' : 'false',
          Compliance: encrypted ? 'SOC2' : 'none'
        },
        status: ['available', 'backing-up', 'maintenance'][Math.floor(Math.random() * 3)],
        created_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        specifications: {
          instance_type: instanceClass.type,
          vcpu: instanceClass.vcpu,
          memory_gb: instanceClass.memory,
          storage_gb: storageSize,
          engine: engine.name,
          engine_version: engine.versions[Math.floor(Math.random() * engine.versions.length)],
          multi_az: multiAz,
          encrypted,
          backup_retention_period: isProduction ? (7 + Math.floor(Math.random() * 28)) : Math.floor(Math.random() * 7),
          publicly_accessible: !isProduction && Math.random() > 0.7,
          storage_type: storageType,
          iops: storageType === 'io1' ? Math.floor(storageSize * 3) : undefined,
          read_replicas: isProduction && Math.random() > 0.6 ? [`${app.toLowerCase()}-${env}-db-${i + 1}-replica-1`] : [],
          maintenance_window: `${['sun', 'mon', 'tue', 'wed', 'thu'][Math.floor(Math.random() * 5)]}:0${2 + Math.floor(Math.random() * 4)}:00-${['sun', 'mon', 'tue', 'wed', 'thu'][Math.floor(Math.random() * 5)]}:0${6 + Math.floor(Math.random() * 2)}:00`,
          backup_window: `0${Math.floor(Math.random() * 6)}:00-0${Math.floor(Math.random() * 6) + 6}:00`,
          parameter_group: `${engine.name}${engine.versions[0].split('.')[0]}${engine.versions[0].split('.')[1]}`,
          subnet_group: `${env}-db-subnet-group`,
          security_groups: [`sg-${Math.random().toString(36).substr(2, 8)}`, `sg-${Math.random().toString(36).substr(2, 8)}`]
        }
      };
    });
  };

  const generateS3Data = (): AWSResource[] => {
    const applications = ["UserAuth", "PaymentProcessor", "OrderManagement", "InventorySystem", "RecommendationEngine"];
    const teams = ["Platform", "Commerce", "Analytics", "Infrastructure", "Security"];
    const regions = ["us-east-1", "us-west-2", "eu-west-1"];
    const environments = ["production", "staging", "development"];

    return Array.from({ length: 25 }, (_, i) => ({
      id: `bucket-${i + 1}`,
      type: 'S3' as const,
      name: `${applications[i % applications.length].toLowerCase()}-${environments[i % environments.length]}-bucket-${i + 1}`,
      region: regions[i % regions.length],
      application: applications[i % applications.length],
      team: teams[i % teams.length],
      environment: environments[i % environments.length],
      cost_monthly: Math.round(Math.random() * 500 + 50),
      tags: {
        Application: applications[i % applications.length],
        Team: teams[i % teams.length],
        Environment: environments[i % environments.length],
        Purpose: ['backup', 'logs', 'static-assets', 'data-lake'][i % 4]
      },
      status: 'active',
      created_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      specifications: {
        bucket_size_gb: Math.round(Math.random() * 1000 + 100)
      }
    }));
  };

  const generateSyntheticAWSData = (): AWSResource[] => {
    // Fallback synthetic data generation
    const applications = ["UserAuth", "PaymentProcessor", "OrderManagement", "InventorySystem"];
    const teams = ["Platform", "Commerce", "Analytics", "Infrastructure"];
    const regions = ["us-east-1", "us-west-2", "eu-west-1"];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `resource-${i}`,
      type: ['EC2', 'RDS', 'S3'][i % 3] as 'EC2' | 'RDS' | 'S3',
      name: `resource-${i}`,
      region: regions[i % regions.length],
      application: applications[i % applications.length],
      team: teams[i % teams.length],
      environment: ['production', 'staging', 'development'][i % 3],
      cost_monthly: Math.round(Math.random() * 1000 + 100),
      tags: {
        Application: applications[i % applications.length],
        Team: teams[i % teams.length]
      },
      status: 'running',
      created_date: new Date().toISOString()
    }));
  };

  const generateProjectSummaries = (resources: AWSResource[]): ProjectSummary[] => {
    const projectMap = new Map<string, ProjectSummary>();

    resources.forEach(resource => {
      const key = `${resource.application}-${resource.team}`;
      
      if (!projectMap.has(key)) {
        projectMap.set(key, {
          project: resource.application,
          team: resource.team,
          total_cost: 0,
          resource_count: 0,
          resources: { ec2: 0, rds: 0, s3: 0 },
          environments: []
        });
      }

      const project = projectMap.get(key)!;
      project.total_cost += resource.cost_monthly;
      project.resource_count += 1;
      project.resources[resource.type.toLowerCase() as keyof typeof project.resources] += 1;
      
      if (!project.environments.includes(resource.environment)) {
        project.environments.push(resource.environment);
      }
    });

    return Array.from(projectMap.values()).sort((a, b) => b.total_cost - a.total_cost);
  };

  const handleChatQuery = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    setChatInput('');

    try {
      // Call dedicated infrastructure AI endpoint with Claude integration
      const botCoreUrl = import.meta.env.VITE_BOT_CORE_URL || 'http://localhost:6000';
      const response = await fetch(`${botCoreUrl}/infrastructure-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: chatInput,
          context: 'inventory', // Use inventory context for AWS resources
          data: {
            resources: resources,
            projectSummaries: projectSummaries,
            totalCost: resources.reduce((sum, r) => sum + r.cost_monthly, 0),
            resourceCounts: {
              ec2: resources.filter(r => r.type === 'EC2').length,
              rds: resources.filter(r => r.type === 'RDS').length,
              s3: resources.filter(r => r.type === 'S3').length
            },
            totalResources: resources.length,
            topApplications: projectSummaries.slice(0, 5).map(p => ({
              name: p.project,
              cost: p.total_cost,
              resources: p.resource_count
            })),
            // Enhanced data for better AI analysis
            resourcesByType: {
              ec2: resources.filter(r => r.type === 'EC2'),
              rds: resources.filter(r => r.type === 'RDS'),
              s3: resources.filter(r => r.type === 'S3')
            },
            // Detailed RDS analysis data
            rdsAnalysis: {
              engineBreakdown: resources.filter(r => r.type === 'RDS').reduce((acc, r) => {
                const engine = r.specifications?.engine || 'unknown';
                if (!acc[engine]) acc[engine] = { count: 0, cost: 0, versions: new Set() };
                acc[engine].count++;
                acc[engine].cost += r.cost_monthly;
                if (r.specifications?.engine_version) acc[engine].versions.add(r.specifications.engine_version);
                return acc;
              }, {} as Record<string, any>),
              securityCompliance: {
                encrypted: resources.filter(r => r.type === 'RDS' && r.specifications?.encrypted).length,
                unencrypted: resources.filter(r => r.type === 'RDS' && !r.specifications?.encrypted).length,
                publiclyAccessible: resources.filter(r => r.type === 'RDS' && r.specifications?.publicly_accessible).length,
                multiAZ: resources.filter(r => r.type === 'RDS' && r.specifications?.multi_az).length
              },
              performanceAnalysis: {
                instanceTypes: resources.filter(r => r.type === 'RDS').reduce((acc, r) => {
                  const type = r.specifications?.instance_type || 'unknown';
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>),
                storageTypes: resources.filter(r => r.type === 'RDS').reduce((acc, r) => {
                  const type = r.specifications?.storage_type || 'unknown';
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              }
            },
            costAnalysis: {
              averageCostPerResource: resources.length > 0 ? resources.reduce((sum, r) => sum + r.cost_monthly, 0) / resources.length : 0,
              highestCostResource: resources.reduce((max, r) => r.cost_monthly > max.cost_monthly ? r : max, resources[0] || {}),
              costByTeam: projectSummaries.reduce((acc, p) => {
                acc[p.team] = (acc[p.team] || 0) + p.total_cost;
                return acc;
              }, {} as Record<string, number>),
              costByEnvironment: resources.reduce((acc, r) => {
                acc[r.environment] = (acc[r.environment] || 0) + r.cost_monthly;
                return acc;
              }, {} as Record<string, number>)
            },
            regions: [...new Set(resources.map(r => r.region))],
            environments: [...new Set(resources.map(r => r.environment))],
            teams: [...new Set(resources.map(r => r.team))],
            applications: [...new Set(resources.map(r => r.application))]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response || 'I apologize, but I couldn\'t process your request at the moment.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I encountered an error processing your request (${error.message}). Here's what I can tell you based on the current data:\n\n${generateFallbackResponse(chatInput)}`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const generateFallbackResponse = (query: string): string => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('cost') || queryLower.includes('expensive')) {
      const totalCost = resources.reduce((sum, r) => sum + r.cost_monthly, 0);
      const topProject = projectSummaries[0];
      return `💰 **Cost Analysis**\n• Total monthly cost: $${totalCost.toLocaleString()}\n• Top spending project: ${topProject?.project} ($${topProject?.total_cost.toLocaleString()})\n• Total resources: ${resources.length}`;
    }
    
    if (queryLower.includes('ec2')) {
      const ec2Count = resources.filter(r => r.type === 'EC2').length;
      const ec2Cost = resources.filter(r => r.type === 'EC2').reduce((sum, r) => sum + r.cost_monthly, 0);
      return `🖥️ **EC2 Summary**\n• Total EC2 instances: ${ec2Count}\n• Monthly EC2 cost: $${ec2Cost.toLocaleString()}\n• Average cost per instance: $${Math.round(ec2Cost / ec2Count)}`;
    }
    
    if (queryLower.includes('rds') || queryLower.includes('database')) {
      const rdsResources = resources.filter(r => r.type === 'RDS');
      const rdsEngines = [...new Set(rdsResources.map(r => r.specifications?.engine).filter(Boolean))];
      const rdsCost = rdsResources.reduce((sum, r) => sum + r.cost_monthly, 0);
      const unencrypted = rdsResources.filter(r => !r.specifications?.encrypted).length;
      const prodWithoutMultiAZ = rdsResources.filter(r => r.environment === 'production' && !r.specifications?.multi_az).length;
      
      if (queryLower.includes('engine')) {
        const engineStats = rdsResources.reduce((acc, r) => {
          const engine = r.specifications?.engine || 'unknown';
          acc[engine] = (acc[engine] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const engineList = Object.entries(engineStats).map(([engine, count]) => `${engine}: ${count}`).join(', ');
        return `🗄️ **Database Engine Analysis**\n• ${engineList}\n• Total: ${rdsResources.length} instances\n• Most used: ${Object.entries(engineStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}`;
      }
      
      if (queryLower.includes('security') || queryLower.includes('encryption')) {
        return `🔒 **Database Security Assessment**\n• Unencrypted databases: ${unencrypted}\n• Production without Multi-AZ: ${prodWithoutMultiAZ}\n• Security compliance: ${unencrypted === 0 ? 'GOOD' : 'NEEDS ATTENTION'}`;
      }
      
      if (queryLower.includes('cost') || queryLower.includes('optimization')) {
        const expensiveRDS = rdsResources.sort((a, b) => b.cost_monthly - a.cost_monthly)[0];
        return `💰 **Database Cost Analysis**\n• Total RDS cost: $${rdsCost.toLocaleString()}/month\n• Most expensive: ${expensiveRDS?.name} ($${expensiveRDS?.cost_monthly})\n• Average per instance: $${Math.round(rdsCost / rdsResources.length)}`;
      }
      
      return `🗄️ **RDS Database Summary**\n• Total instances: ${rdsResources.length}\n• Engines: ${rdsEngines.join(', ')}\n• Monthly cost: $${rdsCost.toLocaleString()}\n• Production instances: ${rdsResources.filter(r => r.environment === 'production').length}`;
    }
    
    return `📊 **General Overview**\n• Total resources: ${resources.length}\n• Projects: ${projectSummaries.length}\n• Monthly cost: $${resources.reduce((sum, r) => sum + r.cost_monthly, 0).toLocaleString()}\n• Resource types: EC2 (${resources.filter(r => r.type === 'EC2').length}), RDS (${resources.filter(r => r.type === 'RDS').length}), S3 (${resources.filter(r => r.type === 'S3').length})`;
  };

  const generateArchitectureDiagram = () => {
    const topProjects = projectSummaries.slice(0, 5);
    let diagram = 'graph TD\n';
    
    topProjects.forEach((project, index) => {
      const nodeId = `P${index}`;
      diagram += `    ${nodeId}["${project.project}<br/>Team: ${project.team}<br/>$${project.total_cost.toLocaleString()}/mo"]\n`;
      
      // Add resource type nodes
      if (project.resources.ec2 > 0) {
        diagram += `    ${nodeId}_EC2["EC2: ${project.resources.ec2} instances"]\n`;
        diagram += `    ${nodeId} --> ${nodeId}_EC2\n`;
      }
      if (project.resources.rds > 0) {
        diagram += `    ${nodeId}_RDS["RDS: ${project.resources.rds} databases"]\n`;
        diagram += `    ${nodeId} --> ${nodeId}_RDS\n`;
      }
      if (project.resources.s3 > 0) {
        diagram += `    ${nodeId}_S3["S3: ${project.resources.s3} buckets"]\n`;
        diagram += `    ${nodeId} --> ${nodeId}_S3\n`;
      }
    });

    return diagram;
  };

  const filteredResources = resources.filter(resource => {
    const projectMatch = !selectedProject || `${resource.application}-${resource.team}` === selectedProject;
    const typeMatch = !selectedResourceType || resource.type === selectedResourceType;
    return projectMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-800 text-xl">Loading AWS inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AWS Cloud Inventory</h1>
          <p className="text-gray-600">Real-time AWS resource management with AI-powered insights</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setViewMode('resources')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewMode === 'resources' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🏗️ Resources
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewMode === 'chat' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              🤖 AI Assistant
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {viewMode === 'overview' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <LiquidGlassCard className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {resources.length}
                </div>
                <div className="text-gray-600">Total Resources</div>
              </LiquidGlassCard>

              <LiquidGlassCard className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${resources.reduce((sum, r) => sum + r.cost_monthly, 0).toLocaleString()}
                </div>
                <div className="text-gray-600">Monthly Cost</div>
              </LiquidGlassCard>

              <LiquidGlassCard className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {projectSummaries.length}
                </div>
                <div className="text-gray-600">Active Projects</div>
              </LiquidGlassCard>

              <LiquidGlassCard className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {[...new Set(resources.map(r => r.region))].length}
                </div>
                <div className="text-gray-600">AWS Regions</div>
              </LiquidGlassCard>
            </div>

            {/* Project Summaries and Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidGlassCard>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Projects by Cost</h2>
                <div className="space-y-3">
                  {projectSummaries.slice(0, 8).map((project, index) => (
                    <div key={`${project.project}-${project.team}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          #{index + 1} {project.project}
                        </h3>
                        <span className="text-green-600 font-bold">${project.total_cost.toLocaleString()}/mo</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">Team:</span> {project.team}
                          <br />
                          <span className="text-gray-500">Resources:</span> {project.resource_count}
                        </div>
                        <div>
                          <span className="text-gray-500">EC2:</span> {project.resources.ec2} | 
                          <span className="text-gray-500"> RDS:</span> {project.resources.rds} | 
                          <span className="text-gray-500"> S3:</span> {project.resources.s3}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Environments:</div>
                        <div className="flex flex-wrap gap-1">
                          {project.environments.map(env => (
                            <span key={env} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {env}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Architecture Overview</h2>
                <MermaidDiagram 
                  chart={generateArchitectureDiagram()}
                  className="h-96"
                />
              </LiquidGlassCard>
            </div>
          </>
        )}

        {/* Resources Tab */}
        {viewMode === 'resources' && (
          <>
            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/50 mb-6">
              <div className="flex gap-4 items-center">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Projects</option>
                  {projectSummaries.map(project => (
                    <option key={`${project.project}-${project.team}`} value={`${project.project}-${project.team}`}>
                      {project.project} ({project.team})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedResourceType}
                  onChange={(e) => setSelectedResourceType(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Resource Types</option>
                  <option value="EC2">EC2 Instances</option>
                  <option value="RDS">RDS Databases</option>
                  <option value="S3">S3 Buckets</option>
                </select>

                <button
                  onClick={fetchAWSData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Resource List */}
            <LiquidGlassCard>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                AWS Resources ({filteredResources.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-gray-600 font-semibold">Resource</th>
                      <th className="pb-3 text-gray-600 font-semibold">Type</th>
                      <th className="pb-3 text-gray-600 font-semibold">Project/Team</th>
                      <th className="pb-3 text-gray-600 font-semibold">Environment</th>
                      <th className="pb-3 text-gray-600 font-semibold">Region</th>
                      <th className="pb-3 text-gray-600 font-semibold">Monthly Cost</th>
                      <th className="pb-3 text-gray-600 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((resource) => (
                      <tr key={resource.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <div className="font-medium text-gray-800">{resource.name}</div>
                          {resource.specifications?.instance_type && (
                            <div className="text-sm text-gray-500">{resource.specifications.instance_type}</div>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            resource.type === 'EC2' ? 'bg-blue-100 text-blue-700' :
                            resource.type === 'RDS' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {resource.type}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-gray-800">{resource.application}</div>
                          <div className="text-sm text-gray-500">{resource.team}</div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            resource.environment === 'production' ? 'bg-red-100 text-red-700' :
                            resource.environment === 'staging' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {resource.environment}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600">{resource.region}</td>
                        <td className="py-3 text-green-600 font-semibold">${resource.cost_monthly.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-sm ${
                            resource.status === 'running' || resource.status === 'available' || resource.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {resource.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </LiquidGlassCard>
          </>
        )}

        {/* Chat Tab */}
        {viewMode === 'chat' && (
          <div className="space-y-6">
            {/* Large Chat Interface */}
            <LiquidGlassCard className="min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">💬 AI Infrastructure Assistant</h2>
                <div className="text-sm text-gray-500">
                  {chatMessages.length} messages
                </div>
              </div>
              
              {/* Large Chat Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-4 py-4 bg-gray-50/50 rounded-xl min-h-[400px]">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-16">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold mb-2">Welcome to your AI Infrastructure Assistant!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      I can help you analyze costs, optimize resources, identify trends, and answer questions about your AWS infrastructure.
                    </p>
                  </div>
                )}
                
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                        message.type === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {message.type === 'user' ? '👤' : '🤖'}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block px-6 py-4 rounded-2xl text-base leading-relaxed ${
                          message.type === 'user'
                            ? 'bg-blue-100 text-black border border-blue-200 rounded-br-md'
                            : 'bg-white text-black border border-gray-200 rounded-bl-md shadow-sm'
                        }`}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        <div className={`text-xs text-gray-500 mt-2 ${message.type === 'user' ? 'text-right' : ''}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-4xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                        🤖
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-6 py-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600">Analyzing your AWS infrastructure...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Large Chat Input */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col space-y-4">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about your AWS infrastructure... (e.g., 'What are our highest cost resources?' or 'Show me optimization opportunities')"
                    className="w-full h-24 px-6 py-4 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatQuery();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                    <button
                      onClick={handleChatQuery}
                      disabled={chatLoading || !chatInput.trim()}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors font-semibold text-base"
                    >
                      {chatLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Send Message</span>
                          <span>📤</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {demoQueries.map((demo, index) => (
                <LiquidGlassCard key={index} className="cursor-pointer hover:scale-105 transition-transform">
                  <button
                    onClick={() => setChatInput(demo.query)}
                    className="w-full text-left p-4"
                  >
                    <div className="text-2xl mb-2">{demo.label.split(' ')[0]}</div>
                    <div className="font-semibold text-gray-800 mb-1">
                      {demo.label.substring(demo.label.indexOf(' ') + 1)}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {demo.query}
                    </div>
                  </button>
                </LiquidGlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* AI Assistant */}
      <AIAssistant 
        key="aws-inventory-ai-assistant"
        context="inventory" 
        data={{
          resources: resources,
          projectSummaries: projectSummaries,
          totalCost: resources.reduce((sum, r) => sum + r.cost_monthly, 0),
          resourceCounts: {
            ec2: resources.filter(r => r.type === 'EC2').length,
            rds: resources.filter(r => r.type === 'RDS').length,
            s3: resources.filter(r => r.type === 'S3').length
          },
          totalResources: resources.length,
          topApplications: projectSummaries.slice(0, 5).map(p => ({
            name: p.project,
            cost: p.total_cost,
            resources: p.resource_count
          }))
        }}
        onAction={(action, params) => {
          console.log('AI Action:', action, params);
          // Handle AI-suggested actions like filtering, optimization recommendations, etc.
        }}
      />

    </div>
  );
};

export default AWSInventory;