import boto3
import json
import os
import asyncio

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)

MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"

async def get_claude_response(prompt: str) -> str:
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 1024,
        "temperature": 0.5
    }

    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: bedrock.invoke_model(
                body=json.dumps(body),
                modelId=MODEL_ID,
                contentType="application/json",
                accept="application/json"
            )
        )
        result = json.loads(response['body'].read())
        print("PROMPT SENT TO CLAUDE:", prompt)
        print("CLAUDE RESPONSE:", result)
        return result['content'][0]['text']
    except Exception as e:
        print(f"Claude API Error: {e}")
        raise Exception(f"Claude API unavailable: {e}")