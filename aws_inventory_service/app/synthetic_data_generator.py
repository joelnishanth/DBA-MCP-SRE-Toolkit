import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
import json

class SyntheticDataGenerator:
    def __init__(self):
        self.applications = [
            "UserAuth", "PaymentProcessor", "OrderManagement", "InventorySystem", 
            "RecommendationEngine", "NotificationService", "AnalyticsPlatform", 
            "ContentManagement", "CustomerSupport", "LoggingService"
        ]
        
        self.teams = [
            "Platform", "Commerce", "Analytics", "Infrastructure", "Security", 
            "Mobile", "Frontend", "Backend", "DevOps", "DataEngineering"
        ]
        
        self.regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "us-central-1"]
        
        self.instance_types = {
            "small": ["t3.small", "t3.medium", "m5.large"],
            "medium": ["m5.xlarge", "m5.2xlarge", "c5.xlarge"],
            "large": ["m5.4xlarge", "r5.2xlarge", "c5.4xlarge"],
            "xlarge": ["r5.8xlarge", "m5.12xlarge", "c5.12xlarge"]
        }
        
        self.database_types = ["PostgreSQL", "MySQL", "Aurora-PostgreSQL", "Aurora-MySQL", "ClickHouse", "Redis"]
        
        # Enhanced cost and resource specifications
        self.instance_specs = {
            "t3.small": {"vcpu": 2, "memory_gb": 2, "network_gbps": 5, "hourly_cost": 0.0208, "storage_type": "EBS"},
            "t3.medium": {"vcpu": 2, "memory_gb": 4, "network_gbps": 5, "hourly_cost": 0.0416, "storage_type": "EBS"},
            "m5.large": {"vcpu": 2, "memory_gb": 8, "network_gbps": 10, "hourly_cost": 0.096, "storage_type": "EBS"},
            "m5.xlarge": {"vcpu": 4, "memory_gb": 16, "network_gbps": 10, "hourly_cost": 0.192, "storage_type": "EBS"},
            "m5.2xlarge": {"vcpu": 8, "memory_gb": 32, "network_gbps": 10, "hourly_cost": 0.384, "storage_type": "EBS"},
            "c5.xlarge": {"vcpu": 4, "memory_gb": 8, "network_gbps": 10, "hourly_cost": 0.17, "storage_type": "EBS"},
            "m5.4xlarge": {"vcpu": 16, "memory_gb": 64, "network_gbps": 10, "hourly_cost": 0.768, "storage_type": "EBS"},
            "r5.2xlarge": {"vcpu": 8, "memory_gb": 64, "network_gbps": 10, "hourly_cost": 0.504, "storage_type": "EBS"},
            "c5.4xlarge": {"vcpu": 16, "memory_gb": 32, "network_gbps": 10, "hourly_cost": 0.68, "storage_type": "EBS"},
            "r5.8xlarge": {"vcpu": 32, "memory_gb": 256, "network_gbps": 10, "hourly_cost": 2.016, "storage_type": "EBS"},
            "m5.12xlarge": {"vcpu": 48, "memory_gb": 192, "network_gbps": 12, "hourly_cost": 2.304, "storage_type": "EBS"},
            "c5.12xlarge": {"vcpu": 48, "memory_gb": 96, "network_gbps": 12, "hourly_cost": 2.04, "storage_type": "EBS"}
        }
        
        # RDS instance specifications
        self.rds_specs = {
            "db.t3.micro": {"vcpu": 2, "memory_gb": 1, "hourly_cost": 0.017, "storage_type": "gp2"},
            "db.t3.small": {"vcpu": 2, "memory_gb": 2, "hourly_cost": 0.034, "storage_type": "gp2"},
            "db.m5.large": {"vcpu": 2, "memory_gb": 8, "hourly_cost": 0.192, "storage_type": "gp2"},
            "db.m5.xlarge": {"vcpu": 4, "memory_gb": 16, "hourly_cost": 0.384, "storage_type": "gp2"},
            "db.r5.large": {"vcpu": 2, "memory_gb": 16, "hourly_cost": 0.24, "storage_type": "gp2"},
            "db.r5.xlarge": {"vcpu": 4, "memory_gb": 32, "hourly_cost": 0.48, "storage_type": "gp2"},
            "db.r5.2xlarge": {"vcpu": 8, "memory_gb": 64, "hourly_cost": 0.96, "storage_type": "gp2"}
        }
        
        # Usage patterns for different workload types
        self.workload_patterns = {
            "web_app": {"cpu_base": 15, "cpu_peak": 75, "memory_base": 40, "memory_peak": 85, "network_pattern": "moderate"},
            "database": {"cpu_base": 25, "cpu_peak": 90, "memory_base": 60, "memory_peak": 95, "network_pattern": "high"},
            "analytics": {"cpu_base": 45, "cpu_peak": 95, "memory_base": 70, "memory_peak": 98, "network_pattern": "burst"},
            "cache": {"cpu_base": 10, "cpu_peak": 40, "memory_base": 80, "memory_peak": 95, "network_pattern": "low"},
            "api": {"cpu_base": 20, "cpu_peak": 80, "memory_base": 30, "memory_peak": 70, "network_pattern": "moderate"},
            "batch": {"cpu_base": 60, "cpu_peak": 100, "memory_base": 50, "memory_peak": 90, "network_pattern": "low"}
        }
        
        # Storage types and costs
        self.storage_costs = {
            "gp2": 0.10,  # per GB per month
            "gp3": 0.08,
            "io1": 0.125,
            "io2": 0.125,
            "st1": 0.045,
            "sc1": 0.025
        }
        
        self.ec2_instances = []
        self.rds_instances = []
        self.databases = []
        self.cost_data = []
        
    def initialize_data(self):
        """Generate all synthetic data"""
        print("Generating EC2 instances...")
        self._generate_ec2_instances()
        print(f"Generated {len(self.ec2_instances)} EC2 instances")
        
        print("Generating RDS instances...")
        self._generate_rds_instances()
        print(f"Generated {len(self.rds_instances)} RDS instances")
        
        print("Generating databases...")
        self._generate_databases()
        print(f"Generated {len(self.databases)} databases")
        
        print("Generating cost data...")
        self._generate_cost_data()
        print(f"Generated {len(self.cost_data)} cost records")
        
    def _generate_ec2_instances(self):
        """Generate synthetic EC2 instances with comprehensive metrics"""
        self.ec2_instances = []
        
        for i in range(150):  # Generate 150 EC2 instances
            app = random.choice(self.applications)
            team = random.choice(self.teams)
            region = random.choice(self.regions)
            environment = random.choice(["production", "staging", "development"])
            
            # Determine workload pattern and instance size based on application
            if app in ["PaymentProcessor", "OrderManagement", "RecommendationEngine"]:
                size_category = random.choices(["medium", "large", "xlarge"], weights=[0.3, 0.5, 0.2])[0]
                workload_type = random.choice(["web_app", "api", "database"])
            elif app in ["AnalyticsPlatform", "LoggingService"]:
                size_category = random.choices(["large", "xlarge"], weights=[0.6, 0.4])[0]
                workload_type = random.choice(["analytics", "batch"])
            elif app in ["UserAuth", "NotificationService"]:
                size_category = random.choices(["small", "medium"], weights=[0.6, 0.4])[0]
                workload_type = random.choice(["web_app", "api"])
            else:
                size_category = random.choices(["small", "medium", "large"], weights=[0.4, 0.4, 0.2])[0]
                workload_type = random.choice(["web_app", "api", "cache"])
                
            instance_type = random.choice(self.instance_types[size_category])
            specs = self.instance_specs[instance_type]
            pattern = self.workload_patterns[workload_type]
            
            # Generate time-based usage patterns (24 hours)
            usage_pattern = self._generate_usage_pattern(pattern, environment)
            
            # Calculate storage metrics
            storage_gb = random.randint(20, 500)
            storage_type = random.choice(["gp2", "gp3", "io1"])
            
            # Generate performance metrics
            performance_metrics = self._generate_performance_metrics(specs, pattern, environment)
            
            # Calculate costs with multiple vectors
            cost_breakdown = self._calculate_ec2_costs(specs, storage_gb, storage_type, usage_pattern, environment)
            
            instance = {
                "instance_id": f"i-{uuid.uuid4().hex[:17]}",
                "instance_type": instance_type,
                "region": region,
                "availability_zone": f"{region}{random.choice(['a', 'b', 'c'])}",
                "application": app,
                "team": team,
                "environment": environment,
                "workload_type": workload_type,
                "launch_time": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "state": random.choices(["running", "stopped"], weights=[0.85, 0.15])[0],
                "uptime_hours": random.randint(100, 8760),  # Hours in a year
                
                # Resource specifications
                "specifications": {
                    "vcpu": specs["vcpu"],
                    "memory_gb": specs["memory_gb"],
                    "network_gbps": specs["network_gbps"],
                    "storage_gb": storage_gb,
                    "storage_type": storage_type
                },
                
                # Usage patterns and metrics
                "usage_metrics": {
                    "cpu_utilization_avg": usage_pattern["cpu_avg"],
                    "cpu_utilization_peak": usage_pattern["cpu_peak"],
                    "memory_utilization_avg": usage_pattern["memory_avg"],
                    "memory_utilization_peak": usage_pattern["memory_peak"],
                    "network_utilization_avg": usage_pattern["network_avg"],
                    "disk_utilization_avg": usage_pattern["disk_avg"],
                    "hourly_usage_pattern": usage_pattern["hourly_pattern"]
                },
                
                # Performance metrics
                "performance_metrics": performance_metrics,
                
                # Consumption data
                "consumption": {
                    "cpu_hours_consumed": round(usage_pattern["cpu_avg"] * specs["vcpu"] * 24 / 100, 2),
                    "memory_gb_hours": round(usage_pattern["memory_avg"] * specs["memory_gb"] * 24 / 100, 2),
                    "network_gb_transferred": round(random.uniform(10, 1000), 2),
                    "storage_iops_consumed": random.randint(1000, 50000),
                    "data_transfer_in_gb": round(random.uniform(5, 500), 2),
                    "data_transfer_out_gb": round(random.uniform(2, 200), 2)
                },
                
                # Cost breakdown
                "cost_breakdown": cost_breakdown,
                
                # Chargeback attributes
                "chargeback_attributes": {
                    "cost_center": f"CC-{team.upper()[:3]}-{random.randint(100, 999)}",
                    "business_unit": random.choice(["Engineering", "Product", "Operations", "Analytics"]),
                    "project_code": f"PRJ-{app.upper()[:4]}-{random.randint(10, 99)}",
                    "owner": f"{random.choice(['john', 'jane', 'alex', 'sarah'])}.{random.choice(['smith', 'doe', 'johnson', 'brown'])}@company.com",
                    "budget_allocation": round(random.uniform(1000, 10000), 2),
                    "priority": random.choice(["high", "medium", "low"]),
                    "sla_tier": random.choice(["gold", "silver", "bronze"])
                },
                
                # Tags for enhanced filtering
                "tags": {
                    "Application": app,
                    "Team": team,
                    "Environment": environment,
                    "WorkloadType": workload_type,
                    "CostCenter": f"CC-{team.upper()[:3]}-{random.randint(100, 999)}",
                    "Owner": f"{random.choice(['john', 'jane', 'alex', 'sarah'])}.{random.choice(['smith', 'doe', 'johnson', 'brown'])}",
                    "AutoShutdown": random.choice(["enabled", "disabled"]),
                    "BackupRequired": random.choice(["yes", "no"]),
                    "Compliance": random.choice(["SOX", "HIPAA", "PCI", "none"])
                }
            }
            
            self.ec2_instances.append(instance)
    
    def _generate_usage_pattern(self, pattern: Dict, environment: str) -> Dict:
        """Generate realistic usage patterns based on workload type and environment"""
        # Environment multipliers
        env_multipliers = {
            "production": {"cpu": 1.0, "memory": 1.0, "network": 1.0},
            "staging": {"cpu": 0.6, "memory": 0.7, "network": 0.5},
            "development": {"cpu": 0.3, "memory": 0.4, "network": 0.2}
        }
        
        multiplier = env_multipliers[environment]
        
        # Generate 24-hour usage pattern
        hourly_pattern = []
        for hour in range(24):
            if pattern["network_pattern"] == "burst":
                # Analytics workloads - high usage during business hours
                if 8 <= hour <= 18:
                    cpu_factor = random.uniform(0.8, 1.0)
                    memory_factor = random.uniform(0.9, 1.0)
                else:
                    cpu_factor = random.uniform(0.2, 0.4)
                    memory_factor = random.uniform(0.3, 0.5)
            elif pattern["network_pattern"] == "high":
                # Database workloads - consistent high usage
                cpu_factor = random.uniform(0.7, 1.0)
                memory_factor = random.uniform(0.8, 1.0)
            else:
                # Web/API workloads - variable usage
                cpu_factor = random.uniform(0.4, 0.9)
                memory_factor = random.uniform(0.5, 0.8)
            
            hourly_pattern.append({
                "hour": hour,
                "cpu_utilization": round(min(pattern["cpu_base"] + (pattern["cpu_peak"] - pattern["cpu_base"]) * cpu_factor, 100) * multiplier["cpu"], 2),
                "memory_utilization": round(min(pattern["memory_base"] + (pattern["memory_peak"] - pattern["memory_base"]) * memory_factor, 100) * multiplier["memory"], 2),
                "network_utilization": round(random.uniform(10, 80) * multiplier["network"], 2)
            })
        
        # Calculate averages
        cpu_avg = round(sum(h["cpu_utilization"] for h in hourly_pattern) / 24, 2)
        memory_avg = round(sum(h["memory_utilization"] for h in hourly_pattern) / 24, 2)
        network_avg = round(sum(h["network_utilization"] for h in hourly_pattern) / 24, 2)
        
        return {
            "cpu_avg": cpu_avg,
            "cpu_peak": round(max(h["cpu_utilization"] for h in hourly_pattern), 2),
            "memory_avg": memory_avg,
            "memory_peak": round(max(h["memory_utilization"] for h in hourly_pattern), 2),
            "network_avg": network_avg,
            "disk_avg": round(random.uniform(20, 70), 2),
            "hourly_pattern": hourly_pattern
        }
    
    def _generate_performance_metrics(self, specs: Dict, pattern: Dict, environment: str) -> Dict:
        """Generate performance metrics based on instance specs and usage patterns"""
        base_performance = {
            "production": 1.0,
            "staging": 0.8,
            "development": 0.6
        }[environment]
        
        return {
            "response_time_ms": round(random.uniform(50, 500) / base_performance, 2),
            "throughput_rps": round(random.uniform(100, 2000) * base_performance, 2),
            "error_rate_percent": round(random.uniform(0.1, 2.0) / base_performance, 3),
            "availability_percent": round(random.uniform(99.5, 99.99), 3),
            "cpu_efficiency": round(random.uniform(0.6, 0.95), 3),
            "memory_efficiency": round(random.uniform(0.7, 0.9), 3),
            "network_latency_ms": round(random.uniform(1, 20), 2),
            "disk_iops": random.randint(1000, 10000),
            "disk_throughput_mbps": round(random.uniform(50, 500), 2)
        }
    
    def _calculate_ec2_costs(self, specs: Dict, storage_gb: int, storage_type: str, usage_pattern: Dict, environment: str) -> Dict:
        """Calculate comprehensive cost breakdown for EC2 instance"""
        # Base compute cost
        compute_cost_hourly = specs["hourly_cost"]
        
        # Storage cost (monthly)
        storage_cost_monthly = storage_gb * self.storage_costs[storage_type]
        storage_cost_hourly = storage_cost_monthly / (30 * 24)  # Convert to hourly
        
        # Data transfer costs
        data_transfer_cost = random.uniform(5, 50)  # Monthly
        
        # Additional costs based on usage
        high_cpu_surcharge = 0.02 if usage_pattern["cpu_avg"] > 80 else 0
        high_memory_surcharge = 0.015 if usage_pattern["memory_avg"] > 90 else 0
        
        # Environment-based cost adjustments
        env_factor = {"production": 1.0, "staging": 0.8, "development": 0.6}[environment]
        
        total_hourly = (compute_cost_hourly + storage_cost_hourly + high_cpu_surcharge + high_memory_surcharge) * env_factor
        
        return {
            "compute_cost_hourly": round(compute_cost_hourly * env_factor, 4),
            "storage_cost_hourly": round(storage_cost_hourly, 4),
            "data_transfer_cost_monthly": round(data_transfer_cost, 2),
            "high_usage_surcharge": round((high_cpu_surcharge + high_memory_surcharge) * env_factor, 4),
            "total_hourly_cost": round(total_hourly, 4),
            "total_monthly_cost": round(total_hourly * 24 * 30, 2),
            "cost_per_vcpu_hour": round(total_hourly / specs["vcpu"], 4),
            "cost_per_gb_memory_hour": round(total_hourly / specs["memory_gb"], 4)
        }
            
    def _generate_rds_instances(self):
        """Generate synthetic RDS instances with comprehensive metrics"""
        self.rds_instances = []
        
        for i in range(45):  # Generate 45 RDS instances
            app = random.choice(self.applications)
            team = random.choice(self.teams)
            region = random.choice(self.regions)
            environment = random.choice(["production", "staging", "development"])
            
            db_type = random.choice(["Aurora-PostgreSQL", "Aurora-MySQL", "PostgreSQL", "MySQL"])
            
            # Select RDS instance type based on application criticality
            if app in ["PaymentProcessor", "OrderManagement"] and environment == "production":
                rds_instance_type = random.choice(["db.r5.xlarge", "db.r5.2xlarge", "db.m5.xlarge"])
            elif environment == "production":
                rds_instance_type = random.choice(["db.m5.large", "db.m5.xlarge", "db.r5.large"])
            else:
                rds_instance_type = random.choice(["db.t3.small", "db.t3.medium", "db.m5.large"])
            
            specs = self.rds_specs.get(rds_instance_type, self.rds_specs["db.t3.small"])
            
            # Storage configuration
            allocated_storage = random.choice([20, 50, 100, 200, 500, 1000, 2000])
            storage_type = random.choice(["gp2", "gp3", "io1"])
            
            # Generate database-specific usage patterns
            db_usage_pattern = self._generate_db_usage_pattern(db_type, environment, app)
            
            # Generate database performance metrics
            db_performance = self._generate_db_performance_metrics(specs, db_type, environment)
            
            # Calculate RDS costs
            rds_cost_breakdown = self._calculate_rds_costs(specs, allocated_storage, storage_type, db_usage_pattern, environment, db_type)
            
            instance = {
                "db_instance_identifier": f"{app.lower()}-{db_type.lower().replace('-', '')}-{random.randint(1, 99):02d}",
                "db_instance_class": rds_instance_type,
                "engine": db_type,
                "engine_version": self._get_db_version(db_type),
                "region": region,
                "availability_zone": f"{region}{random.choice(['a', 'b', 'c'])}",
                "application": app,
                "team": team,
                "environment": environment,
                "creation_time": (datetime.now() - timedelta(days=random.randint(1, 730))).isoformat(),
                "db_status": random.choices(["available", "stopped", "maintenance"], weights=[0.8, 0.15, 0.05])[0],
                "uptime_hours": random.randint(100, 8760),
                
                # Database specifications
                "specifications": {
                    "vcpu": specs["vcpu"],
                    "memory_gb": specs["memory_gb"],
                    "allocated_storage_gb": allocated_storage,
                    "storage_type": storage_type,
                    "multi_az": random.choice([True, False]),
                    "backup_retention_days": random.choice([7, 14, 30]),
                    "publicly_accessible": random.choice([True, False])
                },
                
                # Database usage metrics
                "usage_metrics": {
                    "cpu_utilization_avg": db_usage_pattern["cpu_avg"],
                    "cpu_utilization_peak": db_usage_pattern["cpu_peak"],
                    "memory_utilization_avg": db_usage_pattern["memory_avg"],
                    "memory_utilization_peak": db_usage_pattern["memory_peak"],
                    "connection_utilization_avg": db_usage_pattern["connection_avg"],
                    "connection_utilization_peak": db_usage_pattern["connection_peak"],
                    "storage_utilization_percent": round(random.uniform(30, 85), 2),
                    "hourly_usage_pattern": db_usage_pattern["hourly_pattern"]
                },
                
                # Database performance metrics
                "performance_metrics": db_performance,
                
                # Database consumption data
                "consumption": {
                    "total_connections_daily": random.randint(1000, 50000),
                    "queries_per_second_avg": round(random.uniform(10, 1000), 2),
                    "data_read_gb_daily": round(random.uniform(1, 100), 2),
                    "data_written_gb_daily": round(random.uniform(0.5, 50), 2),
                    "backup_storage_gb": round(allocated_storage * random.uniform(0.1, 0.5), 2),
                    "log_storage_gb": round(random.uniform(1, 20), 2),
                    "read_iops_consumed": random.randint(1000, 20000),
                    "write_iops_consumed": random.randint(500, 10000)
                },
                
                # Cost breakdown
                "cost_breakdown": rds_cost_breakdown,
                
                # Chargeback attributes
                "chargeback_attributes": {
                    "cost_center": f"CC-{team.upper()[:3]}-{random.randint(100, 999)}",
                    "business_unit": random.choice(["Engineering", "Product", "Operations", "Analytics"]),
                    "project_code": f"PRJ-{app.upper()[:4]}-{random.randint(10, 99)}",
                    "database_owner": f"{random.choice(['john', 'jane', 'alex', 'sarah'])}.{random.choice(['smith', 'doe', 'johnson', 'brown'])}@company.com",
                    "budget_allocation": round(random.uniform(2000, 15000), 2),
                    "criticality": random.choice(["critical", "high", "medium", "low"]),
                    "compliance_requirements": random.choice(["SOX", "HIPAA", "PCI", "GDPR", "none"]),
                    "data_classification": random.choice(["public", "internal", "confidential", "restricted"])
                },
                
                # Enhanced tags
                "tags": {
                    "Application": app,
                    "Team": team,
                    "Environment": environment,
                    "DatabaseType": db_type,
                    "CostCenter": f"CC-{team.upper()[:3]}-{random.randint(100, 999)}",
                    "Owner": f"{random.choice(['john', 'jane', 'alex', 'sarah'])}.{random.choice(['smith', 'doe', 'johnson', 'brown'])}",
                    "BackupSchedule": random.choice(["daily", "weekly", "continuous"]),
                    "MaintenanceWindow": random.choice(["sun:03:00-sun:04:00", "sat:02:00-sat:03:00"]),
                    "MonitoringEnabled": random.choice(["true", "false"]),
                    "EncryptionEnabled": random.choice(["true", "false"]),
                    "Compliance": random.choice(["SOX", "HIPAA", "PCI", "GDPR", "none"])
                }
            }
            
            self.rds_instances.append(instance)
    
    def _generate_db_usage_pattern(self, db_type: str, environment: str, application: str) -> Dict:
        """Generate database-specific usage patterns"""
        # Database type patterns
        db_patterns = {
            "PostgreSQL": {"cpu_base": 20, "cpu_peak": 80, "memory_base": 50, "memory_peak": 90, "connection_base": 20, "connection_peak": 150},
            "MySQL": {"cpu_base": 15, "cpu_peak": 75, "memory_base": 45, "memory_peak": 85, "connection_base": 15, "connection_peak": 120},
            "Aurora-PostgreSQL": {"cpu_base": 25, "cpu_peak": 85, "memory_base": 55, "memory_peak": 95, "connection_base": 30, "connection_peak": 200},
            "Aurora-MySQL": {"cpu_base": 20, "cpu_peak": 80, "memory_base": 50, "memory_peak": 90, "connection_base": 25, "connection_peak": 180}
        }
        
        pattern = db_patterns.get(db_type, db_patterns["PostgreSQL"])
        
        # Environment multipliers
        env_multipliers = {
            "production": {"cpu": 1.0, "memory": 1.0, "connections": 1.0},
            "staging": {"cpu": 0.6, "memory": 0.7, "connections": 0.4},
            "development": {"cpu": 0.3, "memory": 0.4, "connections": 0.2}
        }
        
        multiplier = env_multipliers[environment]
        
        # Generate 24-hour database usage pattern
        hourly_pattern = []
        for hour in range(24):
            # Database usage typically peaks during business hours
            if 8 <= hour <= 18:
                usage_factor = random.uniform(0.7, 1.0)
            elif 19 <= hour <= 22:
                usage_factor = random.uniform(0.4, 0.7)
            else:
                usage_factor = random.uniform(0.1, 0.4)
            
            # Analytics applications have different patterns
            if application in ["AnalyticsPlatform", "RecommendationEngine"]:
                if 2 <= hour <= 6:  # Batch processing hours
                    usage_factor = random.uniform(0.8, 1.0)
            
            hourly_pattern.append({
                "hour": hour,
                "cpu_utilization": round(min(pattern["cpu_base"] + (pattern["cpu_peak"] - pattern["cpu_base"]) * usage_factor, 100) * multiplier["cpu"], 2),
                "memory_utilization": round(min(pattern["memory_base"] + (pattern["memory_peak"] - pattern["memory_base"]) * usage_factor, 100) * multiplier["memory"], 2),
                "connection_count": round(min(pattern["connection_base"] + (pattern["connection_peak"] - pattern["connection_base"]) * usage_factor, pattern["connection_peak"]) * multiplier["connections"], 0)
            })
        
        # Calculate averages
        cpu_avg = round(sum(h["cpu_utilization"] for h in hourly_pattern) / 24, 2)
        memory_avg = round(sum(h["memory_utilization"] for h in hourly_pattern) / 24, 2)
        connection_avg = round(sum(h["connection_count"] for h in hourly_pattern) / 24, 0)
        
        return {
            "cpu_avg": cpu_avg,
            "cpu_peak": round(max(h["cpu_utilization"] for h in hourly_pattern), 2),
            "memory_avg": memory_avg,
            "memory_peak": round(max(h["memory_utilization"] for h in hourly_pattern), 2),
            "connection_avg": connection_avg,
            "connection_peak": max(h["connection_count"] for h in hourly_pattern),
            "hourly_pattern": hourly_pattern
        }
    
    def _generate_db_performance_metrics(self, specs: Dict, db_type: str, environment: str) -> Dict:
        """Generate database-specific performance metrics"""
        base_performance = {
            "production": 1.0,
            "staging": 0.8,
            "development": 0.6
        }[environment]
        
        # Database type performance characteristics
        db_characteristics = {
            "PostgreSQL": {"query_time_base": 50, "throughput_base": 500},
            "MySQL": {"query_time_base": 45, "throughput_base": 600},
            "Aurora-PostgreSQL": {"query_time_base": 30, "throughput_base": 800},
            "Aurora-MySQL": {"query_time_base": 35, "throughput_base": 750}
        }
        
        char = db_characteristics.get(db_type, db_characteristics["PostgreSQL"])
        
        return {
            "avg_query_time_ms": round(char["query_time_base"] / base_performance, 2),
            "queries_per_second": round(char["throughput_base"] * base_performance, 2),
            "slow_query_count_daily": random.randint(0, 100),
            "deadlock_count_daily": random.randint(0, 10),
            "cache_hit_ratio_percent": round(random.uniform(85, 99), 2),
            "buffer_pool_hit_ratio_percent": round(random.uniform(90, 99.5), 2),
            "replication_lag_ms": round(random.uniform(0, 100), 2) if random.choice([True, False]) else 0,
            "connection_success_rate_percent": round(random.uniform(98, 100), 3),
            "disk_queue_depth": round(random.uniform(0.1, 5.0), 2),
            "read_latency_ms": round(random.uniform(1, 10), 2),
            "write_latency_ms": round(random.uniform(2, 15), 2)
        }
    
    def _calculate_rds_costs(self, specs: Dict, storage_gb: int, storage_type: str, usage_pattern: Dict, environment: str, db_type: str) -> Dict:
        """Calculate comprehensive RDS cost breakdown"""
        # Base compute cost
        compute_cost_hourly = specs["hourly_cost"]
        
        # Storage costs
        storage_cost_monthly = storage_gb * self.storage_costs[storage_type]
        storage_cost_hourly = storage_cost_monthly / (30 * 24)
        
        # Backup storage cost (typically 20-50% of primary storage)
        backup_storage_gb = storage_gb * random.uniform(0.2, 0.5)
        backup_cost_monthly = backup_storage_gb * 0.095  # $0.095 per GB for backup storage
        backup_cost_hourly = backup_cost_monthly / (30 * 24)
        
        # Data transfer costs
        data_transfer_cost_monthly = random.uniform(10, 100)
        
        # High usage surcharges
        high_cpu_surcharge = 0.05 if usage_pattern["cpu_avg"] > 80 else 0
        high_connection_surcharge = 0.02 if usage_pattern["connection_avg"] > 100 else 0
        
        # Multi-AZ surcharge (doubles compute cost)
        multi_az_multiplier = 2.0 if random.choice([True, False]) else 1.0
        
        # Aurora premium
        aurora_premium = 0.1 if "Aurora" in db_type else 0
        
        # Environment factor
        env_factor = {"production": 1.0, "staging": 0.8, "development": 0.6}[environment]
        
        total_compute_hourly = (compute_cost_hourly * multi_az_multiplier + aurora_premium + high_cpu_surcharge + high_connection_surcharge) * env_factor
        total_hourly = total_compute_hourly + storage_cost_hourly + backup_cost_hourly
        
        return {
            "compute_cost_hourly": round(total_compute_hourly, 4),
            "storage_cost_hourly": round(storage_cost_hourly, 4),
            "backup_cost_hourly": round(backup_cost_hourly, 4),
            "data_transfer_cost_monthly": round(data_transfer_cost_monthly, 2),
            "multi_az_surcharge": round((compute_cost_hourly * (multi_az_multiplier - 1)) * env_factor, 4),
            "aurora_premium_hourly": round(aurora_premium * env_factor, 4),
            "high_usage_surcharge": round((high_cpu_surcharge + high_connection_surcharge) * env_factor, 4),
            "total_hourly_cost": round(total_hourly, 4),
            "total_monthly_cost": round(total_hourly * 24 * 30 + data_transfer_cost_monthly, 2),
            "cost_per_vcpu_hour": round(total_hourly / specs["vcpu"], 4),
            "cost_per_gb_memory_hour": round(total_hourly / specs["memory_gb"], 4),
            "cost_per_gb_storage_month": round(storage_cost_monthly / storage_gb, 4)
        }
            
    def _generate_databases(self):
        """Generate databases running on EC2 instances"""
        self.databases = []
        
        # Generate databases on EC2 instances
        for ec2 in self.ec2_instances:
            # 70% chance an EC2 instance has databases
            if random.random() < 0.7:
                num_databases = random.choices([1, 2, 3, 4], weights=[0.5, 0.3, 0.15, 0.05])[0]
                
                for db_num in range(num_databases):
                    db_type = random.choice(self.database_types)
                    
                    database = {
                        "database_id": f"db-{uuid.uuid4().hex[:12]}",
                        "database_name": f"{ec2['application'].lower()}_{db_type.lower().replace('-', '_')}_{db_num + 1}",
                        "database_type": db_type,
                        "version": self._get_db_version(db_type),
                        "host_type": "EC2",
                        "host_instance_id": ec2["instance_id"],
                        "host_instance_type": ec2["instance_type"],
                        "region": ec2["region"],
                        "application": ec2["application"],
                        "team": ec2["team"],
                        "environment": ec2["environment"],
                        "port": self._get_default_port(db_type),
                        "database_size_gb": round(random.uniform(0.5, 500), 2),
                        "active_connections": random.randint(1, 50),
                        "max_connections": random.randint(50, 500),
                        "queries_per_second": round(random.uniform(10, 1000), 2),
                        "slow_queries_per_hour": random.randint(0, 50),
                        "cache_hit_ratio": round(random.uniform(0.7, 0.99), 3),
                        "replication_lag_ms": random.randint(0, 1000) if random.random() < 0.3 else 0,
                        "backup_enabled": random.choice([True, False]),
                        "last_backup": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
                        "tags": ec2["tags"],
                        "created_at": ec2["launch_time"],
                        "status": "running" if ec2["state"] == "running" else "stopped"
                    }
                    
                    self.databases.append(database)
        
        # Add RDS databases
        for rds in self.rds_instances:
            database = {
                "database_id": rds["db_instance_identifier"],
                "database_name": rds["db_instance_identifier"],
                "database_type": rds["engine"],
                "version": rds["engine_version"],
                "host_type": "RDS",
                "host_instance_id": rds["db_instance_identifier"],
                "host_instance_type": rds["db_instance_class"],
                "region": rds["region"],
                "application": rds["application"],
                "team": rds["team"],
                "environment": rds["environment"],
                "port": self._get_default_port(rds["engine"]),
                "database_size_gb": rds["specifications"]["allocated_storage_gb"],
                "active_connections": int(rds["usage_metrics"]["connection_utilization_avg"]),
                "max_connections": random.randint(100, 1000),
                "queries_per_second": round(random.uniform(50, 2000), 2),
                "slow_queries_per_hour": random.randint(0, 20),
                "cache_hit_ratio": round(random.uniform(0.8, 0.99), 3),
                "replication_lag_ms": random.randint(0, 500) if rds["specifications"]["multi_az"] else 0,
                "backup_enabled": True,
                "last_backup": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
                "tags": rds["tags"],
                "created_at": rds["creation_time"],
                "status": rds["db_status"]
            }
            
            self.databases.append(database)
    
    def _generate_cost_data(self):
        """Generate comprehensive historical cost data with multi-dimensional breakdowns"""
        self.cost_data = []
        
        # Generate 6 months of daily cost data
        for days_ago in range(180):
            date = datetime.now() - timedelta(days=days_ago)
            
            # EC2 costs with detailed breakdown
            for instance in self.ec2_instances:
                if instance["state"] == "running":
                    cost_breakdown = instance["cost_breakdown"]
                    
                    # Add daily variance (±10%)
                    variance_factor = random.uniform(0.9, 1.1)
                    
                    # Create detailed cost records
                    base_record = {
                        "date": date.strftime("%Y-%m-%d"),
                        "application": instance["application"],
                        "team": instance["team"],
                        "environment": instance["environment"],
                        "region": instance["region"],
                        "instance_id": instance["instance_id"],
                        "instance_type": instance["instance_type"],
                        "currency": "USD",
                        "workload_type": instance["workload_type"],
                        "cost_center": instance["chargeback_attributes"]["cost_center"],
                        "business_unit": instance["chargeback_attributes"]["business_unit"],
                        "project_code": instance["chargeback_attributes"]["project_code"]
                    }
                    
                    # Compute costs
                    self.cost_data.append({
                        **base_record,
                        "service_type": "EC2-Compute",
                        "cost": round(cost_breakdown["compute_cost_hourly"] * 24 * variance_factor, 4),
                        "usage_hours": 24,
                        "vcpu_hours": instance["specifications"]["vcpu"] * 24,
                        "memory_gb_hours": instance["specifications"]["memory_gb"] * 24,
                        "cost_per_vcpu": cost_breakdown["cost_per_vcpu_hour"],
                        "cost_per_gb_memory": cost_breakdown["cost_per_gb_memory_hour"]
                    })
                    
                    # Storage costs
                    self.cost_data.append({
                        **base_record,
                        "service_type": "EC2-Storage",
                        "cost": round(cost_breakdown["storage_cost_hourly"] * 24 * variance_factor, 4),
                        "storage_gb": instance["specifications"]["storage_gb"],
                        "storage_type": instance["specifications"]["storage_type"],
                        "iops_consumed": instance["consumption"]["storage_iops_consumed"]
                    })
                    
                    # Data transfer costs
                    if cost_breakdown["data_transfer_cost_monthly"] > 0:
                        self.cost_data.append({
                            **base_record,
                            "service_type": "EC2-DataTransfer",
                            "cost": round(cost_breakdown["data_transfer_cost_monthly"] / 30 * variance_factor, 4),
                            "data_transfer_in_gb": instance["consumption"]["data_transfer_in_gb"],
                            "data_transfer_out_gb": instance["consumption"]["data_transfer_out_gb"]
                        })
            
            # RDS costs with detailed breakdown
            for instance in self.rds_instances:
                if instance["db_status"] == "available":
                    cost_breakdown = instance["cost_breakdown"]
                    variance_factor = random.uniform(0.9, 1.1)
                    
                    base_record = {
                        "date": date.strftime("%Y-%m-%d"),
                        "application": instance["application"],
                        "team": instance["team"],
                        "environment": instance["environment"],
                        "region": instance["region"],
                        "db_instance_identifier": instance["db_instance_identifier"],
                        "db_instance_class": instance["db_instance_class"],
                        "engine": instance["engine"],
                        "currency": "USD",
                        "cost_center": instance["chargeback_attributes"]["cost_center"],
                        "business_unit": instance["chargeback_attributes"]["business_unit"],
                        "project_code": instance["chargeback_attributes"]["project_code"]
                    }
                    
                    # Database compute costs
                    self.cost_data.append({
                        **base_record,
                        "service_type": "RDS-Compute",
                        "cost": round(cost_breakdown["compute_cost_hourly"] * 24 * variance_factor, 4),
                        "usage_hours": 24,
                        "vcpu_hours": instance["specifications"]["vcpu"] * 24,
                        "memory_gb_hours": instance["specifications"]["memory_gb"] * 24,
                        "avg_connections": instance["usage_metrics"]["connection_utilization_avg"],
                        "queries_per_second": instance["performance_metrics"]["queries_per_second"]
                    })
                    
                    # Database storage costs
                    self.cost_data.append({
                        **base_record,
                        "service_type": "RDS-Storage",
                        "cost": round(cost_breakdown["storage_cost_hourly"] * 24 * variance_factor, 4),
                        "allocated_storage_gb": instance["specifications"]["allocated_storage_gb"],
                        "storage_type": instance["specifications"]["storage_type"],
                        "storage_utilization_percent": instance["usage_metrics"]["storage_utilization_percent"],
                        "read_iops": instance["consumption"]["read_iops_consumed"],
                        "write_iops": instance["consumption"]["write_iops_consumed"]
                    })
                    
                    # Backup costs
                    if cost_breakdown["backup_cost_hourly"] > 0:
                        self.cost_data.append({
                            **base_record,
                            "service_type": "RDS-Backup",
                            "cost": round(cost_breakdown["backup_cost_hourly"] * 24 * variance_factor, 4),
                            "backup_storage_gb": instance["consumption"]["backup_storage_gb"],
                            "backup_retention_days": instance["specifications"]["backup_retention_days"]
                        })
                    
                    # Multi-AZ surcharge
                    if cost_breakdown["multi_az_surcharge"] > 0:
                        self.cost_data.append({
                            **base_record,
                            "service_type": "RDS-MultiAZ",
                            "cost": round(cost_breakdown["multi_az_surcharge"] * 24 * variance_factor, 4),
                            "multi_az_enabled": instance["specifications"]["multi_az"]
                        })
    
    def _get_db_version(self, db_type: str) -> str:
        """Get realistic database version"""
        versions = {
            "PostgreSQL": ["13.7", "14.5", "15.2", "16.1"],
            "MySQL": ["5.7.38", "8.0.32", "8.0.35"],
            "Aurora-PostgreSQL": ["13.7", "14.6", "15.2"],
            "Aurora-MySQL": ["5.7.mysql_aurora.2.11.1", "8.0.mysql_aurora.3.02.0"],
            "ClickHouse": ["22.8.5.29", "23.3.2.37", "23.8.2.7"],
            "Redis": ["6.2.6", "7.0.4", "7.0.8"]
        }
        return random.choice(versions.get(db_type, ["1.0.0"]))
    
    def _get_default_port(self, db_type: str) -> int:
        """Get default port for database type"""
        ports = {
            "PostgreSQL": 5432,
            "MySQL": 3306,
            "Aurora-PostgreSQL": 5432,
            "Aurora-MySQL": 3306,
            "ClickHouse": 8123,
            "Redis": 6379
        }
        return ports.get(db_type, 5432)
    
    def get_ec2_instances(self) -> List[Dict[str, Any]]:
        return self.ec2_instances
    
    def get_rds_instances(self) -> List[Dict[str, Any]]:
        return self.rds_instances
    
    def get_databases(self) -> List[Dict[str, Any]]:
        return self.databases
    
    def get_cost_data(self) -> List[Dict[str, Any]]:
        return self.cost_data