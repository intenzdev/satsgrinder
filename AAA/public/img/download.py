import os
import requests

# URL des Bildes
url = "https://cdn.discordapp.com/attachments/1312884945685057748/1351519825486151770/youradgoeshere.gif?ex=67daac6c&is=67d95aec&hm=1c9881324ef08c5a09bef8ef4f947d5e88de50511db15393832a216c59244009&"

# Pfad für die Speicherung im aktuellen Verzeichnis
file_path = os.path.join(os.getcwd(), "youradgoeshere.png")

# Datei herunterladen und speichern
response = requests.get(url)
if response.status_code == 200:
    with open(file_path, "wb") as file:
        file.write(response.content)
    print(f"Bild erfolgreich heruntergeladen und als 'logo.png' im aktuellen Ordner gespeichert.")
else:
    print(f"Fehler beim Herunterladen der Datei. Statuscode: {response.status_code}")
