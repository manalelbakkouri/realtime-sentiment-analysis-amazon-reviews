FROM python:3.10-slim

# Installer curl (utile pour debug, optionnel)
RUN apt-get update && apt-get install -y curl

WORKDIR /app

# Copie et installe les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie le code de l'application
COPY . .

# Définir la variable d'environnement FLASK_APP
ENV FLASK_APP=app.py  
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000

# Lancer le serveur Flask
CMD ["python", "-m", "flask", "run"]