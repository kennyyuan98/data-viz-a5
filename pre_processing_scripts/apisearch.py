#code for basic geocoding search
import requests
import sys
import json

url = "https://us1.locationiq.com/v1/search.php"
#change this to the input
query = sys.argv[1]

data = {
    'key': '8d6879e1df3d64',
    'q': query,
    'format': 'json'
}

response = requests.get(url, params=data)

rjson = response.json()
#latitude
lat = rjson[0]['lat']
#longitude
lon = rjson[0]['lon']
#display name
display = rjson[0]['display_name']

#print(lat, lon, display)