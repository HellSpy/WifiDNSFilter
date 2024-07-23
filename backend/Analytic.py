import json
from flask import Blueprint, jsonify
import logging
from collections import Counter

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/get_stats', methods=['GET'])
def get_stats():
    try:
        with open('dns_requests.log', 'r') as f:
            logs = f.readlines()
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Log file not found"}), 500

    request_counts = Counter()
    block_counts = Counter()

    for log in logs:
        # Only process log entries that contain "Domain:" and "Action:"
        if "Domain:" in log and "Action:" in log:
            try:
                parts = log.strip().split(',')
                domain_part = next(part for part in parts if "Domain:" in part)
                action_part = next(part for part in parts if "Action:" in part)
                domain = domain_part.split('Domain: ')[1].strip()
                action = action_part.split('Action: ')[1].strip()
                request_counts[domain] += 1
                if action == "block":
                    block_counts[domain] += 1
            except (IndexError, ValueError, StopIteration) as e:
                print(f"Error parsing log entry: {log}, Error: {e}")  # Debug print for errors
                continue  # Skip the log entry if it is not in the expected format

    most_frequent_domains = request_counts.most_common(10)
    most_blocked_domains = block_counts.most_common(10)

    stats = {
        "total_requests": sum(request_counts.values()),  # Use sum of all requests
        "most_frequent_domains": most_frequent_domains if most_frequent_domains else [("None", 0)],
        "most_blocked_domains": most_blocked_domains if most_blocked_domains else [("None", 0)],
    }

    return jsonify({"status": "success", "data": stats})
