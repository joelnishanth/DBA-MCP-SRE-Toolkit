import docker

client = docker.from_env()

def get_container_logs(name: str, lines: int):
    container = client.containers.get(name)
    return container.logs(tail=lines).decode("utf-8").splitlines()

def get_container_stats(name: str):
    container = client.containers.get(name)
    stats = container.stats(stream=False)
    
    # Calculate CPU percentage properly
    cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
    system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
    cpu_count = stats['cpu_stats']['online_cpus']
    
    cpu_percent = 0.0
    if system_delta > 0 and cpu_delta > 0:
        cpu_percent = (cpu_delta / system_delta) * cpu_count * 100.0
    
    # Get memory stats in MB
    mem_usage_mb = stats['memory_stats']['usage'] / (1024 * 1024)
    mem_limit_mb = stats['memory_stats']['limit'] / (1024 * 1024)
    mem_percent = (mem_usage_mb / mem_limit_mb) * 100 if mem_limit_mb > 0 else 0
    
    return {
        "status": container.status,
        "cpu_percent": round(cpu_percent, 2),
        "memory_usage_mb": round(mem_usage_mb, 2),
        "memory_limit_mb": round(mem_limit_mb, 2),
        "memory_percent": round(mem_percent, 2),
        "container_name": name
    }

def list_container_names():
    return [container.name for container in client.containers.list()]

def fix_container(name: str):
    """
    Apply fixes to a container based on its name.
    Returns a dict with success status and message.
    """
    try:
        container = client.containers.get(name)
        
        # Restart the container as a basic fix
        container.restart()
        
        return {
            "success": True,
            "message": f"Container {name} has been restarted successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to fix container {name}: {str(e)}"
        }