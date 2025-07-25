import requests
from bs4 import BeautifulSoup


DROP_VARIANTS = True
OUTPUT_FILE = 'names.txt'

url_base = 'https://www.20000-names.com/'
page = input('Select page to pull from (e.g. female_english_names): ')
names = []
i = 1
while True:
    url = f'{url_base}{page}'
    if i == 1: url += '.htm'
    else: url += f'_{i:02d}.htm'
    print(f"Getting {url}...")
    
    resp = requests.get(url)
    if resp.status_code == 404: break
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    name_elements = soup.find_all('font', color='#9393FF')
    names_here = 0
    for name in name_elements:
        surrounding_text = name.parent.parent.get_text().lower()
        if DROP_VARIANTS and ('variant' in surrounding_text
            or 'pet form' in surrounding_text):
            continue
        names_here += 1
        names.append(name.get_text().strip().capitalize())
    print(f'Got {names_here} names on this page.')
    i += 1

failed_names = 0
with open(OUTPUT_FILE, 'a') as file:
    for name in names:
        try:
            file.write(name + ',')
        except UnicodeEncodeError:
            failed_names += 1
    

print(f'{len(names)} saved to {OUTPUT_FILE}.')
print(f'{failed_names} had invalid formatting and were not saved.')
