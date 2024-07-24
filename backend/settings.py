from flask import Blueprint, request, jsonify
import threading
from dns_server_config import dns_server, dns_thread, settings, stop_event  # Import necessary variables and functions

settings_bp = Blueprint('settings', __name__)

def restart_dns_server():
    global dns_thread
    if dns_thread and dns_thread.is_alive():
        stop_event.set()  # Signal the DNS server thread to stop
        dns_thread.join()  # Wait for the thread to stop
        stop_event.clear()  # Clear the stop event for the new thread
    dns_thread = threading.Thread(target=dns_server)
    dns_thread.daemon = True
    dns_thread.start()

@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({"status": "success", "data": settings})

@settings_bp.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.json
    if 'dns_server_ip' in data:
        settings['dns_server_ip'] = data['dns_server_ip']
    if 'port_number' in data:
        settings['port_number'] = int(data['port_number'])  # Ensure port_number is stored as an integer
        restart_dns_server()
    if 'enable_logging' in data:
        settings['enable_logging'] = data['enable_logging']
    if 'log_retention' in data:
        settings['log_retention'] = data['log_retention']
    return jsonify({"status": "success", "message": "Settings updated", "data": settings})
