# MilkGuard ESP32 Bluetooth Low Energy (BLE) Firmware Specification — V1

This document specifies the exact Bluetooth Low Energy (BLE) GATT architecture and transmission protocol required for the ESP32 hardware prototype to communicate with the MilkGuard Web Application.

---

## 1. BLE GATT Architecture

### Device Advertising
* **Device Name**: `MilkGuard-ESP32` (or prefix `MilkGuard-*`, e.g., `MilkGuard-POD-01`)
* **Advertising Flag**: General Discoverable Mode (`BLE_GAP_DISC_MODE_GEN`)
* **Advertised Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`

### GATT Primary Service
* **Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b` (MilkGuard Spectroscopy Service)

### GATT Characteristics
| Characteristic Name | UUID | Properties | Purpose |
| :--- | :--- | :--- | :--- |
| **Telemetry Data** | `beb5483e-36e1-4688-b7f5-ea07361b26a8` | `NOTIFY`, `READ` | Emits the JSON payload containing the 14 spectroscopy signals. |
| **Command** | `d290e653-94c0-42b2-b362-09d2458b40e1` | `WRITE` | Receives commands from web app (e.g., `START_SCAN\n`). |

---

## 2. Telemetry Data Format (14 Spectroscopy Channels)

The ESP32 transmits a UTF-8 encoded JSON string terminated by a newline character (`\n`).

### Required JSON Structure
```json
{
  "device_uid": "MG-DEVICE-001",
  "signal_01": 0.823,
  "signal_02": 0.791,
  "signal_03": 0.754,
  "signal_04": 0.718,
  "signal_05": 0.682,
  "signal_06": 0.645,
  "signal_07": 0.612,
  "signal_08": 0.578,
  "signal_09": 0.542,
  "signal_10": 0.510,
  "signal_11": 0.476,
  "signal_12": 0.439,
  "signal_13": 0.398,
  "signal_14": 0.291,
  "is_test_data": false,
  "firmware_version": "v1.0.0"
}
```

### Validation Rules
1. `device_uid` must be a non-empty string.
2. All 14 signals (`signal_01` through `signal_14`) must be present.
3. Every signal value must be a numeric float/double (typically normalized 0.0 to 1.0, or raw ADC/optical counts).
4. No signals can be NaN, null, or undefined.

---

## 3. Reference Arduino C++ Code for ESP32

Copy and flash this sketch onto your ESP32 board using Arduino IDE or PlatformIO:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h> // Requires ArduinoJson library v6 or v7

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define DATA_CHAR_UUID      "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define COMMAND_CHAR_UUID   "d290e653-94c0-42b2-b362-09d2458b40e1"
#define DEVICE_NAME         "MilkGuard-ESP32"
#define DEVICE_UID          "MG-DEVICE-001"

BLEServer* pServer = NULL;
BLECharacteristic* pDataChar = NULL;
BLECharacteristic* pCmdChar = NULL;
bool deviceConnected = false;

// Command Callback Handler
class CommandCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        String rxValue = pCharacteristic->getValue().c_str();
        if (rxValue.length() > 0) {
            Serial.print("Received Command: ");
            Serial.println(rxValue);
            if (rxValue.indexOf("START_SCAN") >= 0) {
                Serial.println("Starting Spectroscopy Scan...");
                performAndSendScan();
            }
        }
    }
};

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println(">> Client Connected to MilkGuard ESP32");
    }

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println(">> Client Disconnected from MilkGuard ESP32. Restarting advertising...");
        pServer->startAdvertising();
    }
};

void performAndSendScan() {
    delay(1000); // Simulate sensor integration time

    StaticJsonDocument<512> doc;
    doc["device_uid"] = DEVICE_UID;
    
    // 14 Spectroscopy Channels (Replace with physical sensor readings if connected)
    doc["signal_01"] = 0.823;
    doc["signal_02"] = 0.791;
    doc["signal_03"] = 0.754;
    doc["signal_04"] = 0.718;
    doc["signal_05"] = 0.682;
    doc["signal_06"] = 0.645;
    doc["signal_07"] = 0.612;
    doc["signal_08"] = 0.578;
    doc["signal_09"] = 0.542;
    doc["signal_10"] = 0.510;
    doc["signal_11"] = 0.476;
    doc["signal_12"] = 0.439;
    doc["signal_13"] = 0.398;
    doc["signal_14"] = 0.291;
    doc["is_test_data"] = false;
    doc["firmware_version"] = "1.0.0";

    char jsonBuffer[512];
    size_t len = serializeJson(doc, jsonBuffer);
    jsonBuffer[len] = '\n';
    jsonBuffer[len + 1] = '\0';

    pDataChar->setValue((uint8_t*)jsonBuffer, len + 1);
    pDataChar->notify();
    Serial.println(">> 14 Spectroscopy signals emitted via BLE notification.");
}

void setup() {
    Serial.begin(115200);
    Serial.println("Initializing MilkGuard BLE Prototype...");

    BLEDevice::init(DEVICE_NAME);
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService *pService = pServer->createService(SERVICE_UUID);

    // Telemetry Data Characteristic
    pDataChar = pService->createCharacteristic(
        DATA_CHAR_UUID,
        BLECharacteristic::PROPERTY_READ |
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pDataChar->addDescriptor(new BLE2902());

    // Command Characteristic
    pCmdChar = pService->createCharacteristic(
        COMMAND_CHAR_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCmdChar->setCallbacks(new CommandCallbacks());

    pService->start();

    // Start advertising
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();

    Serial.println("MilkGuard ESP32 is advertising. Ready to pair in browser!");
}

void loop() {
    // Keep alive loop
    delay(500);
}
```
