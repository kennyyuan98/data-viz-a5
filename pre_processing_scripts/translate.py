#translates and splits up the last column
import csv
import sys

file = sys.argv[1]

reader = csv.DictReader(open(file))
with open('jiko.csv', 'w', newline='') as jiko:
	fieldnames = ['\ufeff日時','路線','場所','被害']
	writer = csv.DictWriter(jiko, fieldnames = fieldnames)
	writer.writeheader()
	for row in reader:
		item = row['被害']
		#add // if it's empty
		if len(item) == 0:
			item += '//'

		#add / between items
		elif len(item) > 0:
			if item[0] == '男' or item[0] == '女':
				item = '/' + item
			if item[0] == '死' or item[0]=='重'or item[0] =='軽' or item[0] =='無' or item[0]== '被': 
				item = '//' + item
			if item[len(item)-1] == '性':
				item = item + '/'
			if item[len(item)-1]=='歳':
				item = item + '//'

		row['被害'] = item
		#print(row['被害'])

		count = 0
		itemcount = row['被害']
		#count how many / there are
		for i in itemcount:
			if i == '/':
				count +=1
		index = 0
		#if there is only one / add another inbetween
		if count ==1:
			#print(itemcount)
			a, b = itemcount.split('/')
			itemcount = a + '//' + b
			row['被害'] = itemcount
			#print(row['被害'])

		#add another / based on how many other people died
		item = row['被害']
		if len(item)> 0:
			#if no one died
			if item[len(item)-1] != '名':
				item = item + '/'
			#if other people died
			elif item[len(item)-1] =='名':
				a = item[0:len(item)-4]
				b = item[len(item)-4: len(item)]

				item = a + '/' + b
			row['被害'] = item
		
		transitem = row['被害']
		
		#brute force translation
		#if it's 不明 leave it as is
		if len(transitem) > 0:
			if transitem == '不明' or transitem == '不明/':
				#ADD CODE
				thing = transitem

			
			else:
				#split it 
				try:
					a, b, c, d = transitem.split('/')
				except ValueError:
					print("Error!")
					print(transitem)
				#translate age
				if len(a) > 0:
					if a[len(a)-1] == '歳':
						#print(a)
						a = a[0:len(a)-1]
					#if decade make it 10s etc
					if a[len(a)-1] == '代':
						a = a[0:len(a)-1]
						a = a + 's'
				#translate gender
				if len(b) > 0:
					if b[0] == '男':
						b = 'Male'
					if b[0] =='女':
						b = 'Female'
				#translate injury
				if len(c) > 0:
					if c[0] == '死':
						c = 'Fatal'
					if c[0] == '重':
						c = 'Severe Injury'
					if c[0] == '軽':
						c = 'Minor Injury'
					if c[0] == '無':
						c = 'No Injury'
					if c[0] == '被':
						c = 'Injury Unknown'
				#translate how many others involved
				if len(d) == 0 and (len(a) > 0 or len(b) >0 or len(c) >0):
					dig = '0'
				elif len(d) > 0:
					digit = ''
					for i in d:
						if i.isdigit():
							digit += i
					dig = digit
					#print(digit)
				else:
					dig = d
				thing = a + '/' + b + '/' + c + '/' + dig
		#update row
		row['被害'] = thing
		writer.writerow(row)

		#ADD CODE
		#replace thing in csv file
		#writer.writerow(row)

		

		#print(row['被害'])
		#print(row['被害'])
		#print(transitem)
		#print(row['被害'])

