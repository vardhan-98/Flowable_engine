from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import uuid
import json
import time
import random
import threading
import requests

app = FastAPI(title="NFX Pre-Upgrade Service Mock", version="1.0")

# Mock request model
class DeviceRequest(BaseModel):
    flowInstanceID: str
    deviceID: str
    step: str

# Helper function to log to Elasticsearch synchronously
def log_to_es(flow_id, device_id, stage, step, status, message, details=None):
    # Random delay between 1 and 30 seconds
    # delay = random.randint(1, 2)
    # print(f"Sleeping for {delay} seconds before logging...")
    # time.sleep(delay)

    # Convert timestamp to Unix timestamp (milliseconds) for ES compatibility
    timestamp_ms = int(datetime.now().timestamp() * 1000)

    doc = {
        "id": str(uuid.uuid4()),
        "flowInstanceId": flow_id,
        "deviceId": device_id,
        "stage": stage,
        "timestamp": timestamp_ms,
        "step": step,
        "status": status,
        "message": message,
        "details": details or {}
    }

    try:
        url = "http://192.168.5.52:8081/device-upgrade-logs/_doc/" + doc["id"]
        headers = {"Content-Type": "application/json"}
        response = requests.put(url, headers=headers, data=json.dumps(doc), timeout=10)

        if response.status_code in [200, 201]:
            print(f"Successfully logged to ES via HTTP: {response.status_code}")
            return doc
        else:
            print(f"HTTP request failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"HTTP logging failed: {e}")

    print("ES logging failed, returning document without indexing")
    return doc

# ------------------------- API Endpoints -------------------------

@app.post("/check_device_compatibility")
def check_device_compatibility(request: DeviceRequest):
    print("Starting check_device_compatibility endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Starting check-device-compatibility check", {"action": "initiated"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Checking UCPE version compatibility", {"ucpe_version": "v1.0"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Verifying disk status", {"disk_status": "Good"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Validating image version", {"image_version": "1.2.3"})

    result = {
        "ucpe_version": "v1.0",
        "disk_status": "Good",
        "image_version": "1.2.3",
        "bios_cpld": "Updated",
        "nic_fw": "1.0.0",
        "ssd_fw": "1.0.1"
    }
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Compatibility check passed", result)
    return doc

@app.post("/pre_upgrade_backup")
def pre_upgrade_backup(request: DeviceRequest):
    print("Starting pre_upgrade_backup endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Initiating pre-upgrade backup process", {"action": "backup_started"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Creating image backup", {"backup_path": "/path/to/image"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Generating MD5 checksum for backup", {"checksum": "abc123"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Verifying out-of-band connection", {"oob_status": "Verified"})

    results = {
        "Image Backup": "/path/to/image",
        "MD5 Checksum": "abc123",
        "OOB connection": "Verified",
        "Staging Image": "/path/to/staging"
    }
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Backup completed", results)
    return doc

@app.post("/reboot_device")
def reboot_device(request: DeviceRequest):
    print("Starting reboot_device endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Initiating device reboot process", {"action": "reboot_initiated"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Preparing device for reboot", {"preparation_status": "completed"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Stopping device services", {"services_stopped": "all"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Issuing reboot command to device", {"command_status": "sent"})

    wait_time = random.randint(5, 10)
    print(f"Waiting for {wait_time} seconds to simulate reboot time...")
    time.sleep(wait_time)

    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", f"Waiting for reboot completion, waited {wait_time} seconds", {"wait_duration": wait_time})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Checking device reboot status", {"reboot_status": "in_progress"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Device reboot process completed successfully", {"final_status": "completed"})

    results = {"upgrade_status": "Completed"}
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Reboot completed", results)
    return doc

@app.post("/mgmt_port")
def mgmt_port(request: DeviceRequest):
    print("Starting mgmt_port endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Starting management port verification", {"action": "port_check_initiated"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Testing management port connectivity", {"connectivity_test": "passed"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Verifying management port configuration", {"config_status": "valid"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Management port status confirmed as operational", {"port_status": "Up"})

    results = {"port_status": "Up"}
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Management port is up", results)
    return doc

@app.post("/post_reboot_checks")
def post_reboot_checks(request: DeviceRequest):
    print("Starting post_reboot_checks endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Initiating post-reboot verification checks", {"action": "checks_started"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Verifying device connectivity after reboot", {"connectivity": "OK"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Checking storage availability", {"storage": "Sufficient"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Validating system integrity post-reboot", {"integrity_check": "passed"})

    results = {"connectivity": "OK", "storage": "Sufficient"}
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Post reboot checks passed", results)
    return doc

@app.post("/device_activation")
def device_activation(request: DeviceRequest):
    print("Starting device_activation endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Initiating device activation process", {"action": "activation_started"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Configuring device settings for activation", {"config_status": "applied"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Activating device services", {"services_activated": "all"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Device activation process completed successfully", {"activation_status": "Completed"})

    results = {"activation_status": "Completed"}
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Device activation completed", results)
    return doc

@app.post("/vnf_spinup_and_config")
def post_activation_check(request: DeviceRequest):
    print("Starting vnf_spinup_and_config endpoint")
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Initiating post-activation verification", {"action": "checks_started"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Checking device connectivity after activation", {"connectivity": "OK"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Verifying storage availability post-activation", {"storage": "Sufficient"})
    log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Validating device activation status", {"validation_status": "passed"})

    results = {"connectivity": "OK", "storage": "Sufficient"}
    doc = log_to_es(request.flowInstanceID, request.deviceID, "Upgrade", request.step, "SUCCESS", "Post activation checks passed", results)
    return doc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
