import os
import requests
import zipfile
import io

# Repository-Informationen
REPO_OWNER = "intenzdev"
REPO_NAME = "satsgrinder"
BRANCH = "codespace-ominous-space-engine-96545xp77xhpgwg"
FOLDER = "AAA"

# GitHub-API-URL, um den Branch als ZIP-Datei herunterzuladen
ZIP_URL = f"https://github.com/{REPO_OWNER}/{REPO_NAME}/archive/refs/heads/{BRANCH}.zip"

def download_and_extract_folder():
    print("Lade Repository-ZIP herunter...")
    response = requests.get(ZIP_URL)

    if response.status_code == 200:
        print("ZIP-Datei erfolgreich heruntergeladen. Entpacke Dateien...")
        
        # ZIP-Datei im Speicher öffnen
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
            # Extrahiere nur den Ordner "AAA"
            extracted_files = [
                item for item in zip_file.namelist() 
                if item.startswith(f"{REPO_NAME}-{BRANCH}/{FOLDER}/")
            ]
            
            if not extracted_files:
                print(f"Der Ordner '{FOLDER}' wurde im Branch '{BRANCH}' nicht gefunden.")
                return

            # Extrahiere die Dateien ins aktuelle Verzeichnis
            for file in extracted_files:
                file_path = file.replace(f"{REPO_NAME}-{BRANCH}/", "")
                if file.endswith("/"):  # Skippe Ordner, erstelle sie stattdessen
                    os.makedirs(file_path, exist_ok=True)
                else:
                    with open(file_path, "wb") as f:
                        f.write(zip_file.read(file))
                    print(f"Erstellt: {file_path}")

        print("Alle Dateien wurden erfolgreich heruntergeladen und extrahiert.")
    else:
        print(f"Fehler beim Herunterladen: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    download_and_extract_folder()
