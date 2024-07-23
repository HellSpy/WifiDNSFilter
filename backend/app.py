import socket
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
import dns.message
import dns.rrset
import dns.resolver
from multiprocessing import Manager, Queue, Lock
from queue import Empty
import logging
import time

# module imports
from Bulk import bulk_bp
from Analytic import analytics_bp

app = Flask(__name__)
CORS(app)

# Initialize the blocklist as a global variable using Manager for shared state
manager = Manager()
blocklist = manager.dict()

# Initialize the lock for synchronizing access to the blocklist
blocklist_lock = Lock()

# Pass the blocklist and blocklist_lock to the Bulk Blueprint
bulk_bp.blocklist = blocklist
bulk_bp.blocklist_lock = blocklist_lock

update_queue = Queue()  # Create a queue for updates

# Register the Bulk Blueprint and Analytics Blueprint
app.register_blueprint(bulk_bp)
app.register_blueprint(analytics_bp)

# Set up logging
logging.basicConfig(level=logging.INFO, filename='dns_requests.log',
                    format='%(asctime)s %(levelname)s %(message)s')

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

def log_dns_request(domain, action):
    """ Log the DNS request details """
    logging.info(f"Domain: {domain}, Action: {action}")

def handle_dns_request(data, addr, sock):
    query = dns.message.from_wire(data)
    domain = str(query.question[0].name).lower().strip()

    if not domain.endswith('.'):
        domain += '.'

    print(f"[DNS Thread] Received DNS query for domain: {domain}")

    action = "resolve"
    # Process the updates from the queue before handling the DNS request
    with blocklist_lock:
        while not update_queue.empty():
            try:
                update = update_queue.get_nowait()
                if update["action"] == "add":
                    blocklist[update["domain"]] = True
                    print(f"[DNS Thread] Added {update['domain']} to blocklist in DNS thread")
                elif update["action"] == "remove":
                    if update["domain"] in blocklist:
                        del blocklist[update["domain"]]
                        print(f"[DNS Thread] Removed {update['domain']} from blocklist in DNS thread")
            except Empty:
                pass

        print(f"[DNS Thread] Current blocklist in DNS thread: {list(blocklist.keys())}")
        if domain in blocklist:
            print(f"[DNS Thread] Domain {domain} is in blocklist. Blocking it.")
            response = dns.message.make_response(query)
            response.answer.append(dns.rrset.from_text(domain, 3600, 'IN', 'A', '0.0.0.0'))
            action = "block"
        else:
            print(f"[DNS Thread] Domain {domain} is not in blocklist. Resolving it.")
            response = dns.message.make_response(query)
            try:
                answers = dns.resolver.resolve(domain)
                for rdata in answers:
                    response.answer.append(dns.rrset.from_text(domain, 3600, 'IN', 'A', rdata.address))
            except dns.resolver.NXDOMAIN:
                response.set_rcode(dns.rcode.NXDOMAIN)

    log_dns_request(domain, action)
    sock.sendto(response.to_wire(), addr)

def dns_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # Allow reuse of addresses
    try:
        sock.bind(("127.0.0.1", 5005))  # Bind to localhost and port 5005
        print("[DNS Thread] DNS server started on 127.0.0.1:5005")
    except Exception as e:
        print(f"[DNS Thread] Failed to bind socket: {e}")
        return

    while True:
        # Handle DNS requests
        data, addr = sock.recvfrom(512)
        handle_dns_request(data, addr, sock)

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
    # Ensure the socket is not already in use
    dns_thread = threading.Thread(target=dns_server)
    dns_thread.daemon = True
    dns_thread.start()

    app.run(host='0.0.0.0', port=5000, debug=True)
