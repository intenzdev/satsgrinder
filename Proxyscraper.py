import requests
from concurrent.futures import ThreadPoolExecutor
import os

# Öffentliche Proxy-Quellen
PROXY_SOURCES = [
    "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all",
    "https://www.proxy-list.download/api/v1/get?type=http"
]

# Webhook-URL
WEBHOOK_URL = "https://discord.com/api/webhooks/1351285824364482583/RT_nl3SqxfMWYcSBZ9t_9mZyXvd7k8ThV1Xaw30N2cvG0obQ5bnaXmMU9qcabJ4JRLEP"

# Test-URL
TEST_URL = "https://httpbin.org/ip"

# Verzeichnis für die Ausgabe
OUTPUT_FILE = "valid_proxies.txt"

# Anzahl der Threads
MAX_THREADS = 50


# Proxies aus Quellen scrapen
def scrape_proxies():
    proxies = set()
    for url in PROXY_SOURCES:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                proxies.update(response.text.splitlines())
        except Exception as e:
            print(f"Fehler beim Abrufen von {url}: {e}")
    return list(proxies)


# Einzelnen Proxy testen
def test_proxy(proxy):
    try:
        response = requests.get(TEST_URL, proxies={"http": f"http://{proxy}", "https": f"http://{proxy}"}, timeout=10)
        if response.status_code == 200:
            print(f"Gültiger Proxy: {proxy}")
            return proxy
    except:
        pass
    return None


# Alle Proxies testen (Multithreading)
def test_proxies(proxies):
    valid_proxies = []
    with ThreadPoolExecutor(max_workers=MAX_THREADS) as executor:
        results = executor.map(test_proxy, proxies)
        valid_proxies = [proxy for proxy in results if proxy]
    return valid_proxies


# Proxies an Discord senden
def send_to_discord(valid_proxies):
    try:
        with open(OUTPUT_FILE, "w") as file:
            file.write("\n".join(valid_proxies))
        files = {"file": open(OUTPUT_FILE, "rb")}
        response = requests.post(WEBHOOK_URL, files=files)
        if response.status_code == 204:
            print("Proxies erfolgreich an Discord gesendet!")
        else:
            print(f"Fehler beim Senden an Discord: {response.status_code}")
    except Exception as e:
        print(f"Fehler beim Senden der Datei: {e}")


# Hauptfunktion
def main():
    print("Scraping Proxies...")
    proxies = scrape_proxies()
    print(f"Es wurden {len(proxies)} Proxies gefunden.")

    print("Teste Proxies...")
    valid_proxies = test_proxies(proxies)
    print(f"{len(valid_proxies)} gültige Proxies gefunden.")

    if valid_proxies:
        print("Sende gültige Proxies an Discord...")
        send_to_discord(valid_proxies)
        print(f"Datei '{OUTPUT_FILE}' erstellt.")
    else:
        print("Keine gültigen Proxies gefunden.")


if __name__ == "__main__":
    main()
