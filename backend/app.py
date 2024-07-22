import socket
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import dns.message
import dns.rrset
import dns.resolver

app = Flask(__name__)
CORS(app)

blocklist = set()

def handle_dns_request(data, addr, sock):
    query = dns.message.from_wire(data)
    domain = str(query.question[0].name)

    if domain in blocklist:
        response = dns.message.make_response(query)
        response.answer.append(dns.rrset.from_text(domain, 3600, 'IN', 'A', '0.0.0.0'))
    else:
        response = dns.message.make_response(query)
        try:
            answers = dns.resolver.resolve(domain)
            for rdata in answers:
                response.answer.append(dns.rrset.from_text(domain, 3600, 'IN', 'A', rdata.address))
        except dns.resolver.NXDOMAIN:
            response.set_rcode(dns.rcode.NXDOMAIN)

    sock.sendto(response.to_wire(), addr)

@app.route('/')
def index():
    return "Welcome to the DNS Filter API"

@app.route('/api/add_blocklist', methods=['POST'])
def add_blocklist():
    domain = request.json.get('domain')
    blocklist.add(domain)
    return jsonify({"status": "success", "message": f"Added {domain} to blocklist"})

@app.route('/api/remove_blocklist', methods=['POST'])
def remove_blocklist():
    domain = request.json.get('domain')
    blocklist.discard(domain)
    return jsonify({"status": "success", "message": f"Removed {domain} from blocklist"})

@app.route('/api/blocklist', methods=['GET'])
def get_blocklist():
    return jsonify(list(blocklist))

@app.route('/api/get_stats', methods=['GET'])
def get_stats():
    return jsonify({"status": "success", "data": "stats"})

def start_dns_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(("0.0.0.0", 5005))  # Use another non-privileged port like 5353
    while True:
        data, addr = sock.recvfrom(512)
        handle_dns_request(data, addr, sock)

if __name__ == '__main__':
    if not threading.current_thread().name == "MainThread":
        dns_thread = threading.Thread(target=start_dns_server)
        dns_thread.daemon = True
        dns_thread.start()
    app.run(host='0.0.0.0', port=5000, debug=True)
