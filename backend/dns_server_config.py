# dns_server_config.py
import socket
import threading
import dns.message
import dns.rrset
import dns.resolver
from multiprocessing import Manager, Lock, Queue
from queue import Empty
import logging

manager = Manager()
blocklist = manager.dict()
blocklist_lock = Lock()
update_queue = Queue()

settings = {
    'dns_server_ip': '127.0.0.1',
    'port_number': 5005,  # Changed to a higher port number
    'enable_logging': True,
    'log_retention': 30  # days
}

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
    if settings["enable_logging"]:
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
                cleaned_domain = clean_domain(update["domain"])
                if update["action"] == "add":
                    blocklist[cleaned_domain] = True
                    print(f"[DNS Thread] Added {cleaned_domain} to blocklist in DNS thread")
                elif update["action"] == "remove":
                    if cleaned_domain in blocklist:
                        del blocklist[cleaned_domain]
                        print(f"[DNS Thread] Removed {cleaned_domain} from blocklist in DNS thread")
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

    sock.sendto(response.to_wire(), addr)

    # Log the DNS request
    log_dns_request(domain, action)

def dns_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind((settings['dns_server_ip'], settings['port_number']))
    while True:
        data, addr = sock.recvfrom(512)
        threading.Thread(target=handle_dns_request, args=(data, addr, sock)).start()


dns_thread = threading.Thread(target=dns_server)
dns_thread.daemon = True
