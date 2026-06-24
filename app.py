from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
import os

print("APP STARTED")

app = Flask(__name__)
CORS(app)

# Home Route
@app.route("/")
def home():
   return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

# Create Database Table
def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transformer_data(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL,
        voltage REAL,
        current REAL,
        status TEXT,
        timestamp TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

# GET ALL DATA
@app.route('/api/data', methods=['GET'])
def get_data():

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM transformer_data
    ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    conn.close()

    result = []

    for row in rows:
        result.append({
            "id": row[0],
            "temperature": row[1],
            "voltage": row[2],
            "current": row[3],
            "status": row[4],
            "timestamp": row[5]
        })

    return jsonify(result)
def send_email_alert(status, temperature, voltage, current):

    print("EMAIL_USER =", sender_email)
    print("EMAIL_PASS EXISTS =", sender_password is not None)

    sender_email = os.environ.get("EMAIL_USER")
    sender_password = os.environ.get("EMAIL_PASS")

    receiver_email = "vigneshuupromo123@gmail.com"

    subject = "Transformer Fault Alert"

    body = f"""
Fault Detected

Status: {status}
Temperature: {temperature}
Voltage: {voltage}
Current: {current}
"""

    msg = MIMEText(body)

    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver_email

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()

    server.login(
        sender_email,
        sender_password
    )

    server.send_message(msg)

    server.quit()

# POST SENSOR DATA
@app.route('/api/sensor', methods=['POST'])
def add_sensor():

    data = request.json

    temperature = data["temperature"]
    voltage = data["voltage"]
    current = data["current"]

    status = "Normal"

    if temperature > 80:
        status = "Overheated"

    elif voltage > 260:
        status = "Voltage Surge"

    elif current > 10:
        status = "Overload"

    # EMAIL ALERT
    if status != "Normal":

      try:
        send_email_alert(
            status,
            temperature,
            voltage,
            current
        )

      except Exception as e:
        print("EMAIL ERROR:", str(e))
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO transformer_data
    (temperature, voltage, current, status, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (
        temperature,
        voltage,
        current,
        status,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Data Saved",
        "status": status
    })
# STATS API
@app.route('/api/stats', methods=['GET'])
def stats():

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM transformer_data")
    total_records = cursor.fetchone()[0]

    cursor.execute("""
    SELECT COUNT(*)
    FROM transformer_data
    WHERE status != 'Normal'
    """)
    fault_count = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "total_records": total_records,
        "fault_count": fault_count
    })
@app.route('/api/healthscore')
def healthscore():

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT COUNT(*) FROM transformer_data"
    )

    total = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM transformer_data WHERE status != 'Normal'"
    )

    faults = cursor.fetchone()[0]

    conn.close()

    if total == 0:
        score = 100
    else:
        score = max(
            0,
            100 - ((faults / total) * 100)
        )

    return jsonify({
        "score": round(score,2)
    })

# Run App
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
