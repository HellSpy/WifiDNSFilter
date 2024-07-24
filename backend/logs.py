from flask import Blueprint, jsonify

logs_bp = Blueprint('logs', __name__)

@logs_bp.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        with open('dns_requests.log', 'r') as f:  # Assuming 'dns_requests.log' is in the same directory as 'app.py'
            log_entries = f.readlines()
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Log file not found"}), 500

    logs = []
    for entry in log_entries:
        print(f"Processing log entry: {entry}")  # Debug print
        parts = entry.split(',')
        if len(parts) >= 3:
            timestamp = parts[0].strip()
            domain_part = next((part for part in parts if "Domain:" in part), "").strip()
            action_part = next((part for part in parts if "Action:" in part), "").strip()
            message = ', '.join(parts[1:]).strip()

            domain = domain_part.split('Domain: ')[1] if 'Domain: ' in domain_part else 'N/A'
            action = action_part.split('Action: ')[1] if 'Action: ' in action_part else 'N/A'

            logs.append({
                "timestamp": timestamp,
                "domain": domain,
                "action": action,
                "message": message
            })
        else:
            print(f"Skipping malformed log entry: {entry}")  # Debug print

    return jsonify({"status": "success", "data": logs})
