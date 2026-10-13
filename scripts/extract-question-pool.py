"""Extract the Boat Operator seamanship question pool PDF into JSON.

Usage: python3 scripts/extract-question-pool.py  (needs pdftotext from poppler)
"""
import json, pathlib, re, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF = ROOT / 'reference/course/Question Pool  Seamanship for Boat Operator.pdf'
OUT = ROOT / 'reference/course/question-pool-seamanship.json'

raw = subprocess.run(['pdftotext', '-layout', str(PDF), '-'], capture_output=True, text=True, check=True).stdout
questions_text, answers_text = re.split(r'\n\s+Answers\s*\n', raw)

header = re.compile(r'\s*(STATE OF ISRAEL|MINISTRY OF TRANSPORT|NATIONAL INFRASTRUCTURES|ADMINISTRATION OF SHIPPING)')
questions, current, option = [], None, None
for line in questions_text.split('\n'):
    text = line.strip()
    if not text or header.match(line) or 'Seamanship Test' in line:
        continue
    q = re.match(r'^(\d{1,3})\s*\.\s*(.*)', text)
    o = re.match(r'^([a-d])\s*\.\s*(.*)', text)
    if q and (current is None or int(q.group(1)) == current['number'] + 1):
        current = {'number': int(q.group(1)), 'question': q.group(2), 'options': {}}
        questions.append(current)
        option = None
    elif o and current:
        option = o.group(1)
        current['options'][option] = o.group(2)
    elif current:
        if option:
            current['options'][option] += ' ' + text
        else:
            current['question'] += ' ' + text

answers = {}
for number, letter in re.findall(r'(\d{1,3})\s+([a-d]|‫?ג)', answers_text):
    number, letter = int(number), {'ג': 'c'}.get(letter.strip('‫‬'), letter)  # 93 is printed as Hebrew gimel
    if number == 253 and 252 not in answers:  # the key prints 252 as a second 253
        number = 252
    answers[number] = letter

for q in questions:
    q['answer'] = answers[q['number']]
    q['answer_text'] = q['options'][q['answer']]
    text = q['question'] + ' ' + ' '.join(q['options'].values())
    q['references_pictures'] = sorted({int(n) for n in re.findall(r'pictures?\s+(\d+)', text, re.I)})

assert [q['number'] for q in questions] == list(range(1, 363)), 'expected questions 1-362'
assert all(len(q['options']) == 4 for q in questions)
OUT.write_text(json.dumps(questions, ensure_ascii=False, indent=1) + '\n')
print(f'{len(questions)} questions -> {OUT.relative_to(ROOT)}')
