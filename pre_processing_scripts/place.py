import csv
import sys

file = sys.argv[1]

reader = csv.DictReader(open(file))
fieldnames = ['\ufeff日時','路線','場所', 'start', 'end', 'combined start', 'combined end','被害']
writer = csv.DictWriter(open('jikofin.csv', 'w', newline=''), fieldnames = fieldnames)
writer.writeheader()
for row in reader:
	item = row['場所']
	line = row['路線']
	#print(item)
	if "〜" in item:
		a, b = item.split("〜")
	elif "〜" not in item:
		a = item
		b = ""
	#a = starting station
	#b = ending station
	#refa = station a + line
	#refb = station b + line
	row['start'] = a
	row['end'] = b



	refa = a + ', ' + line
	if b != "":
		refb = b + ', ' + line 
	else:
		refb = ""
	row['combined start'] = refa
	row['combined end'] = refb
	
	writer.writerow(row)

