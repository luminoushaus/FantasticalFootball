with open('names.txt','r') as f, open('names2.txt', 'w') as f2:
    for line in f:
       for word in line.split():
           f2.write(word + '\n')