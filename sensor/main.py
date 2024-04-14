import network
import time
from machine import Pin
from ds18x20 import DS18X20
from onewire import OneWire

import urequests
import ubinascii

# Constants
SSID = ''
PASSWORD = ''
SERVER_ENDPOINT = ''
SENSOR_NAME = ''
AUTH_USER = ''
AUTH_PASSWORD = ''

# Initialize temperature sensor
ow = OneWire(Pin(10))
temp_sensor = DS18X20(ow)
roms = temp_sensor.scan()

def connect_to_wifi():
    # Connect to WLAN
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    while not wlan.isconnected():
        print('Waiting for connection...')
        time.sleep(1)
    ip = wlan.ifconfig()[0]
    print(f'Connected on {ip}')
    return ip

def read_temperature():
    # Check if any sensors are found
    if not roms:
        print('No sensors found!')
        return None

    # Read temperature from sensor
    temp_sensor.convert_temp()
    time.sleep(0.75)  # Allow sensor to collect data
    for rom in roms:
        temp = round(temp_sensor.read_temp(rom), 2)
        print(temp)
        return temp

def post_temperature(temp, username, password):
    # Create the auth string
    auth_string = '{}:{}'.format(username, password)

    # Encode the auth string to bytes, then to base64
    auth_bytes = ubinascii.b2a_base64(auth_string.encode('utf-8')).strip()

    # Create the headers dictionary
    headers = {
        'Authorization': 'Basic {}'.format(auth_bytes.decode('utf-8')),
        'Content-Type': 'application/json'
    }

    # Post temperature to server
    data = {
        'value': temp,
        'measurePoint': SENSOR_NAME
    }

    try:
        response = urequests.post(SERVER_ENDPOINT, json=data, headers=headers)
        response.close()
    except Exception as e:
        print('Failed to post temperature:', e)

def main():
    try:
        ip = connect_to_wifi()
        while True:
            temp = read_temperature()
            if temp is not None:
                post_temperature(temp, AUTH_USER, AUTH_PASSWORD)
            else:
                print('Reading temp failed')
            time.sleep(30)
    except KeyboardInterrupt:
        machine.reset()

if __name__ == "__main__":
    main()