#include <NewPing.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <string.h>
#include "DHT.h"

// --- Pin Definitions ---
#define TRIGGER_PIN         5
#define ECHO_PIN            18
#define LED_PRESENCIA       26
#define LED_TEMP_HUM        14
#define LED_PLAY_OBRA       4
#define DHTPIN              12

// --- Constants ---
#define DHTTYPE             DHT11
#define PRESENCE_DISTANCE   70
#define MAX_DISTANCE        200
const long INTERVAL_DHT = 2000;

// --- WiFi Configuration ---
const char* ssid = ""; //your WiFi Id
const char* password = ""; //your WiFi password

// --- MQTT Configuration ---
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// --- MQTT Topics ---
const char* topic_presencia        = "/sala/123/presencia";
const char* topic_obra_estado      = "/sala/123/estado";
const char* topic_obra_control     = "/sala/123/comando";
const char* topic_alerta           = "/sala/123/alerta";
const char* topic_temp_actual      = "/sala/123/tempActual";
const char* topic_hum_actual       = "/sala/123/humActual";
const char* topic_set_temp_min     = "/sala/123/setTempMin";
const char* topic_set_temp_max     = "/sala/123/setTempMax";
const char* topic_set_hum_min      = "/sala/123/setHumMin";
const char* topic_set_hum_max      = "/sala/123/setHumMax";

// --- State Variables ---
float setHumMax = 55;
float setHumMin = 10;
float setTempMax = 30;
float setTempMin = 10;
String setObraControl = "OFF";
bool obraEnCurso = false;

char bufferPresencia[4] = "OFF";
char bufferHumedad[10];
char bufferTemperatura[10];

unsigned long previousMillisDHT = 0;

// --- Hardware & Network Instances ---
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

// --- WiFi Connection ---
void setup_wifi() {
  Serial.println("Connecting to WiFi...");
  WiFi.disconnect();
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected. IP address:");
  Serial.println(WiFi.localIP());
}

// --- MQTT Reconnection ---
void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT... ");
    if (client.connect("Esp32_Installation")) {
      Serial.println("connected.");
      client.subscribe(topic_set_temp_min);
      client.subscribe(topic_set_temp_max);
      client.subscribe(topic_set_hum_min);
      client.subscribe(topic_set_hum_max);
      client.subscribe(topic_obra_control);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

// --- MQTT Callback ---
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("Message received [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Update thresholds or control signals
  if (String(topic) == topic_set_temp_min) {
    setTempMin = message.toFloat();
  } else if (String(topic) == topic_set_temp_max) {
    setTempMax = message.toFloat();
  } else if (String(topic) == topic_set_hum_min) {
    setHumMin = message.toFloat();
  } else if (String(topic) == topic_set_hum_max) {
    setHumMax = message.toFloat();
  } else if (String(topic) == topic_obra_control) {
    setObraControl = message;
    obraEnCurso = (message == "ON");
    digitalWrite(LED_PLAY_OBRA, obraEnCurso ? HIGH : LOW);
    Serial.println(obraEnCurso ? "Obra iniciada" : "Obra detenida");
  }
}

// --- Setup ---
void setup() {
  pinMode(LED_PRESENCIA, OUTPUT);
  pinMode(LED_TEMP_HUM, OUTPUT);
  pinMode(LED_PLAY_OBRA, OUTPUT);
  pinMode(TRIGGER_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Serial.begin(9600);
  dht.begin();

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// --- Loop ---
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  delay(200);

  // --- PRESENCE DETECTION ---
  int distancia = sonar.ping_cm();
  Serial.print("Ping: ");
  Serial.print(distancia);
  Serial.println(" cm");

  if (distancia > 0 && distancia < PRESENCE_DISTANCE) {
    strcpy(bufferPresencia, "ON");
    digitalWrite(LED_PRESENCIA, HIGH);
  } else {
    strcpy(bufferPresencia, "OFF");
    digitalWrite(LED_PRESENCIA, LOW);
  }

  bool presenciaOk = client.publish(topic_presencia, bufferPresencia);
  Serial.print("Presencia enviada: ");
  Serial.println(presenciaOk ? "OK" : "FALLÓ");

  delay(100);

  // --- TEMPERATURE & HUMIDITY ---
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillisDHT >= INTERVAL_DHT) {
    previousMillisDHT = currentMillis;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println("Error leyendo DHT11");
      return;
    }

    Serial.print("Humedad: ");
    Serial.print(h);
    Serial.print(" % | Temperatura: ");
    Serial.print(t);
    Serial.println(" °C");

    dtostrf(h, 4, 2, bufferHumedad);
    dtostrf(t, 4, 2, bufferTemperatura);

    bool humOk = client.publish(topic_hum_actual, bufferHumedad);
    bool tempOk = client.publish(topic_temp_actual, bufferTemperatura);

    Serial.print("Humedad enviada: ");
    Serial.println(humOk ? "OK" : "FALLÓ");
    Serial.print("Temperatura enviada: ");
    Serial.println(tempOk ? "OK" : "FALLÓ");

    // Alert LED if out of thresholds
    if (t > setTempMax || t < setTempMin || h > setHumMax || h < setHumMin) {
      digitalWrite(LED_TEMP_HUM, HIGH);
    } else {
      digitalWrite(LED_TEMP_HUM, LOW);
    }

    delay(100);
  }
}
