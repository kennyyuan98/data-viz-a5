#loops through csv and finds geocode
import requests
import sys
import json
import csv
import time

file = sys.argv[1]
reader = csv.DictReader(open(file))
fieldnames = ['\ufeff日時','路線','場所', 'start', 'end', 'combined start', 'combined end', 'Start Name', 'End Name', 'Start Lon', 'Start Lat', 'End Lon', 'End Lat', '被害']
writer = csv.DictWriter(open('fin2.csv', 'w', newline=''), fieldnames = fieldnames)
writer.writeheader()
url = "https://us1.locationiq.com/v1/search.php"
#change this to the input
count = 0
for row in reader:
	count +=1
	querys = row['combined start']
	querye = row['combined end']
	#print(querys)
	#print(querye)
	datas = {
	    'key': '8d6879e1df3d64',
	    'q': querys,
	    'format': 'json'
	}
	time.sleep(.5)
	responses = requests.get(url, params=datas)
	rjsons = responses.json()
	
	try:
		lats = rjsons[0]['lat']
		lons = rjsons[0]['lon']
		#display name
		displays = rjsons[0]['display_name']
	except:
		#print(rjsons)
		lats = "N/A"
		lons = "N/A"
		displays = "N/A"
	
	if len(querye) > 0:
		count +=1
		datae = {
		    'key': '8d6879e1df3d64',
		    'q': querye,
		    'format': 'json'
		}
		time.sleep(.5)
		responsee = requests.get(url, params=datae)

		rjsone = responsee.json()
		try:	
			late = rjsone[0]['lat']

			lone = rjsone[0]['lon']
			
			
			#display name
			displaye = rjsone[0]['display_name']
		except:
			#print(rjsone)
			late = ''
			lone = ''
			displaye = ''
	else:
		late = ''
		lone = ''
		displaye = ''

	row['Start Lat'] = lats
	row['End Lat'] = late
	row['Start Lon'] = lons
	row['End Lon'] = lone
	row['Start Name'] = displays
	row['End Name'] = displaye

	writer.writerow(row)
	print(count)
	if count > 9800:
		break





#print(lat, lon, display)