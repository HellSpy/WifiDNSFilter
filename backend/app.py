# app.py
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from Bulk import bulk_bp
from Analytic import analytics_bp
from logs import logs_bp
from settings import settings_bp
from dns_server_config import dns_thread, log_dns_request, settings, blocklist, blocklist_lock, update_queue

app = Flask(__name__)
CORS(app)

# Pass the blocklist and blocklist_lock to the Bulk Blueprint
bulk_bp.blocklist = blocklist
bulk_bp.blocklist_lock = blocklist_lock

# Register the Bulk Blueprint and Analytics Blueprint
app.register_blueprint(bulk_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(logs_bp)
app.register_blueprint(settings_bp)

def clean_domain(domain):
    """ Ensure the domain is properly formatted """
    domain = domain.lower().strip()
    if domain.startswith('http://'):
        domain = domain[len('http://'):]
    elif domain.startswith('https://'):
        domain = domain[len('https://'):]
    if not domain.endswith('.'):
        domain += '.'
    return domain

@app.route('/')
def index():
    return "Welcome to the DNS Filter API"

@app.route('/api/add_blocklist', methods=['POST'])
def add_blocklist():
    domain = request.json.get('domain')
    cleaned_domain = clean_domain(domain)
    with blocklist_lock:
        update_queue.put({"action": "add", "domain": cleaned_domain})
        print(f"[Flask] Added {cleaned_domain} to blocklist queue")
        # Directly update the blocklist for immediate consistency
        blocklist[cleaned_domain] = True
        print(f"[Flask] Blocklist immediately after adding: {list(blocklist.keys())}")
    return jsonify({"status": "success", "message": f"Added {cleaned_domain} to blocklist"})

@app.route('/api/remove_blocklist', methods=['POST'])
def remove_blocklist():
    domain = request.json.get('domain')
    cleaned_domain = clean_domain(domain)
    with blocklist_lock:
        update_queue.put({"action": "remove", "domain": cleaned_domain})
        print(f"[Flask] Removed {cleaned_domain} from blocklist queue")
        # Directly update the blocklist for immediate consistency
        if cleaned_domain in blocklist:
            del blocklist[cleaned_domain]
        print(f"[Flask] Blocklist immediately after removing: {list(blocklist.keys())}")
    return jsonify({"status": "success", "message": f"Removed {cleaned_domain} from blocklist"})

@app.route('/api/blocklist', methods=['GET'])
def get_blocklist():
    with blocklist_lock:
        print(f"[Flask] Current blocklist when fetching: {list(blocklist.keys())}")
        return jsonify(list(blocklist.keys()))

@app.route('/api/get_stats', methods=['GET'])
def get_stats():
    return jsonify({"status": "success", "data": "stats"})

if __name__ == '__main__':
    dns_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
