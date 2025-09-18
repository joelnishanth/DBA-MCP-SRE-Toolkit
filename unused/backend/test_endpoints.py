import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)

@pytest.mark.asyncio
async def test_diagnose_container():
    mock_logs = ["Log line 1", "Log line 2"]
    mock_status = "Container Status: Error"
    mock_claude_response = "Analysis of the issue..."

    with patch('endpoints.fetch_logs_and_status', new_callable=AsyncMock) as mock_fetch:
        with patch('endpoints.get_claude_response', new_callable=AsyncMock) as mock_claude:
            mock_fetch.return_value = (mock_logs, mock_status)
            mock_claude.return_value = mock_claude_response

            response = client.post("/diagnose", json={"container_name": "test-container"})
            
            assert response.status_code == 200
            data = response.json()
            assert "prompt" in data
            assert "claude_response" in data
            assert data["claude_response"] == mock_claude_response

@pytest.mark.asyncio
async def test_fix_preview():
    mock_logs = ["Log line 1", "Log line 2"]
    mock_status = "Container Status: Error"
    mock_claude_response = """
STEP 1:
Description: Restart the container to clear any temporary issues
Command(s): docker restart test-container
Expected outcome: Container should restart and potentially resolve the issue

STEP 2:
Description: Check container health
Command(s): docker exec test-container some-command
Expected outcome: Command should return successful status
"""

    with patch('endpoints.fetch_logs_and_status', new_callable=AsyncMock) as mock_fetch:
        with patch('endpoints.get_claude_response', new_callable=AsyncMock) as mock_claude:
            mock_fetch.return_value = (mock_logs, mock_status)
            mock_claude.return_value = mock_claude_response

            response = client.post("/fix/preview", json={"container_name": "test-container"})
            
            assert response.status_code == 200
            data = response.json()
            assert "prompt" in data
            assert "fix_plan" in data
            assert "STEP 1:" in data["fix_plan"]
            assert "STEP 2:" in data["fix_plan"]

@pytest.mark.asyncio
async def test_fix_execute_without_confirmation():
    response = client.post("/fix/execute", json={"container_name": "test-container"})
    
    assert response.status_code == 200
    data = response.json()
    assert "error" in data
    assert "requires explicit confirmation" in data["error"]

@pytest.mark.asyncio
async def test_fix_execute_with_confirmation():
    mock_logs = ["Log line 1", "Log line 2"]
    mock_status = "Container Status: Error"
    mock_claude_response = "docker restart test-container\ndocker exec test-container some-command"

    with patch('endpoints.fetch_logs_and_status', new_callable=AsyncMock) as mock_fetch:
        with patch('endpoints.get_claude_response', new_callable=AsyncMock) as mock_claude:
            mock_fetch.return_value = (mock_logs, mock_status)
            mock_claude.return_value = mock_claude_response

            response = client.post("/fix/execute", json={
                "container_name": "test-container",
                "confirmed": True
            })
            
            assert response.status_code == 200
            data = response.json()
            assert "prompt" in data
            assert "claude_response" in data
            assert "commands" in data
            assert len(data["commands"]) == 2
            assert data["commands"][0] == "docker restart test-container"
            assert data["commands"][1] == "docker exec test-container some-command"