import json
from flask import Blueprint, jsonify, request, send_file
import io

bulk_bp = Blueprint('bulk', __name__)

# Use properties of the blueprint to store blocklist and blocklist_lock
bulk_bp.blocklist = None
bulk_bp.blocklist_lock = None

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

@bulk_bp.route('/api/export_blocklist', methods=['GET'])
def export_blocklist():
    blocklist = bulk_bp.blocklist
    blocklist_lock = bulk_bp.blocklist_lock
    if blocklist is None or blocklist_lock is None:
        return jsonify({"status": "error", "message": "Blocklist or blocklist lock not initialized"}), 500

    with blocklist_lock:
        blocklist_data = list(blocklist.keys())
    blocklist_json = json.dumps(blocklist_data)
    return send_file(
        io.BytesIO(blocklist_json.encode()),
        as_attachment=True,
        download_name='blocklist.json',
        mimetype='application/json'
    )

@bulk_bp.route('/api/import_blocklist', methods=['POST'])
def import_blocklist():
    blocklist = bulk_bp.blocklist
    blocklist_lock = bulk_bp.blocklist_lock
    if blocklist is None or blocklist_lock is None:
        return jsonify({"status": "error", "message": "Blocklist or blocklist lock not initialized"}), 500

    file = request.files['file']
    if not file:
        return jsonify({"status": "error", "message": "No file provided"}), 400
    try:
        blocklist_data = json.load(file)
        with blocklist_lock:
            for domain in blocklist_data:
                cleaned_domain = clean_domain(domain)
                blocklist[cleaned_domain] = True
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    return jsonify({"status": "success", "message": "Blocklist imported successfully"})
