def build_prompt(container_name, logs, status, prompt_type="diagnose"):
    if prompt_type == "diagnose":
        return f"""
The database container '{container_name}' is experiencing issues.

Container Status: {status.get('status', 'unknown')}
CPU Usage: {status.get('cpu_percent', 0)}%
Memory Usage: {status.get('memory_usage_mb', 0)} MB ({status.get('memory_percent', 0)}%)
Memory Limit: {status.get('memory_limit_mb', 0)} MB

Recent logs:
{chr(10).join(logs)}

As a DBA expert, please analyze this database container issue and suggest specific database-related resolutions.
"""
    elif prompt_type == "fix_preview":
        return f"""
The database container '{container_name}' is experiencing issues.

Container Status: {status.get('status', 'unknown')}
CPU Usage: {status.get('cpu_percent', 0)}%
Memory Usage: {status.get('memory_usage_mb', 0)} MB ({status.get('memory_percent', 0)}%)
Memory Limit: {status.get('memory_limit_mb', 0)} MB

Recent logs:
{chr(10).join(logs)}

As a DBA expert, provide a detailed step-by-step plan to fix this database container issue.
For each step:
1. Explain what the step does and why it's needed
2. Show the exact command(s) that will be executed
3. Describe the expected outcome

Format your response as follows for each step:
STEP n:
Description: <explanation of what this step does and why>
Command(s): <exact command or commands to execute>
Expected outcome: <what should happen after this step>

---
"""
    elif prompt_type == "fix":
        return f"""
The database container '{container_name}' is experiencing issues.

Container Status: {status.get('status', 'unknown')}
CPU Usage: {status.get('cpu_percent', 0)}%
Memory Usage: {status.get('memory_usage_mb', 0)} MB ({status.get('memory_percent', 0)}%)
Memory Limit: {status.get('memory_limit_mb', 0)} MB

Recent logs:
{chr(10).join(logs)}

As a DBA expert, provide ONLY the exact command or sequence of commands needed to fix this database container issue.
Format your response as a list of commands, one per line, without any additional explanation.
Each command should be ready to run in a shell.
"""