import threading

# In-memory settings storage
settings = {
    "dns_server_ip": "127.0.0.1",
    "port_number": 5005,
    "enable_logging": True,
    "log_retention": 30
}

# Global DNS thread and stop event variable
dns_thread = None
stop_event = threading.Event()

def dns_server():
    import socket
    import time
    from app import handle_dns_request

    while not stop_event.is_set():
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # Allow reuse of addresses
        try:
            sock.bind((settings["dns_server_ip"], settings["port_number"]))  # Bind to IP and port from settings
            print(f"[DNS Thread] DNS server started on {settings['dns_server_ip']}:{settings['port_number']}")
        except Exception as e:
            print(f"[DNS Thread] Failed to bind socket: {e}")
            time.sleep(5)  # Wait before retrying to avoid tight loop
            continue

        while not stop_event.is_set():
            try:
                data, addr = sock.recvfrom(512)
                handle_dns_request(data, addr, sock)
            except Exception as e:
                print(f"[DNS Thread] Error handling request: {e}")
                break  # Exit the inner loop to rebind the socket if an error occurs

        sock.close()
        print("[DNS Thread] Socket closed, stopping DNS server")
