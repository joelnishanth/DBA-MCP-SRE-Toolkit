#!/usr/bin/env python3
from flask import Flask, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/webhook/slack', methods=['POST'])
def slack_webhook():
    data = request.get_json() or {}
    
    print("\n" + "="*60)
    print("🚨 CONTAINER ALERT - SLACK NOTIFICATION")
    print("="*60)
    print(f"📅 Time: {datetime.now().isoformat()}")
    print(f"📦 Container: {data.get('container', 'Unknown')}")
    print(f"⚠️  Status: {data.get('status', 'Unknown')}")
    print(f"🔍 Issue: {data.get('issue', 'Unknown')}")
    print(f"📝 Message: {data.get('text', data.get('message', 'No message'))}")
    print("="*60)
    print("✅ Alert would be sent to #alerts channel")
    print("="*60 + "\n")
    
    return jsonify({
        "ok": True,
        "message": "Alert sent to #alerts channel",
        "timestamp": datetime.now().isoformat(),
        "channel": "#alerts"
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "Mock Slack webhook is running!"})

if __name__ == '__main__':
    print("🔔 Starting Mock Slack Webhook Server...")
    print("📡 Webhook URL: http://localhost:3001/webhook/slack")
    print("🎯 Ready to receive container alerts!")
    app.run(host='0.0.0.0', port=3001, debug=False)