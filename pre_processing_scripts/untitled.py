import sys
import csv
file = sys.argv[1]

reader = csv.DictReader(open(file))
count = 0

for row in reader:
	print(row['combined start'])
	if count > 10:
		break
	count +=1