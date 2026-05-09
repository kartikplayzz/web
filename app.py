from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = os.environ.get("PORT")


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


if __name__ == "__main__":
    ports = [int(PORT)] if PORT else range(8000, 8011)
    server = None
    active_port = None

    for port in ports:
        try:
            server = ThreadingHTTPServer((HOST, port), SiteHandler)
            active_port = port
            break
        except OSError:
            continue

    if server is None or active_port is None:
        raise OSError("No free port found from 8000 to 8010.")

    print(f"Anyaaaa apology site running at http://{HOST}:{active_port}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
