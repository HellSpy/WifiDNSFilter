from flask import Blueprint, request, jsonify

settings_bp = Blueprint('settings', __name__)

# In-memory settings storage
settings = {
    "dns_server_ip": "127.0.0.1",
    "port_number": 5005,
    "enable_logging": True,
    "log_retention": 30
}

@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({"status": "success", "data": settings})

@settings_bp.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.json
    if 'dns_server_ip' in data:
        settings['dns_server_ip'] = data['dns_server_ip']
    if 'port_number' in data:
        settings['port_number'] = data['port_number']
    if 'enable_logging' in data:
        settings['enable_logging'] = data['enable_logging']
    if 'log_retention' in data:
        settings['log_retention'] = data['log_retention']
    return jsonify({"status": "success", "message": "Settings updated", "data": settings})
