import requests
import zipfile
import os

# URL der ZIP-Datei
zip_url = "https://cdn.discordapp.com/attachments/1343330892315103243/1351499298193408072/AAA.zip?ex=67da994e&is=67d947ce&hm=bd180119030d9efc82e6de537da56149dc4326e0fa1431fd2021f35d74c63bf7"

# Speicherpfad für die heruntergeladene ZIP-Datei
zip_file_path = "downloaded_file.zip"

# Herunterladen der ZIP-Datei
print("Lade die ZIP-Datei herunter...")
response = requests.get(zip_url, stream=True)
if response.status_code == 200:
    with open(zip_file_path, "wb") as zip_file:
        for chunk in response.iter_content(chunk_size=1024):
            zip_file.write(chunk)
    print(f"ZIP-Datei erfolgreich heruntergeladen: {zip_file_path}")
else:
    print(f"Fehler beim Herunterladen der Datei. Statuscode: {response.status_code}")
    exit()

# Entpacken der ZIP-Datei ins aktuelle Verzeichnis
print("Entpacke die ZIP-Datei...")
try:
    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(".")  # Entpacke Dateien ins aktuelle Verzeichnis
        print("Dateien wurden erfolgreich entpackt.")
except zipfile.BadZipFile:
    print("Die heruntergeladene Datei ist keine gültige ZIP-Datei.")
    exit()

# Optional: Löschen der ZIP-Datei nach dem Entpacken
os.remove(zip_file_path)
print("Die heruntergeladene ZIP-Datei wurde gelöscht.")
