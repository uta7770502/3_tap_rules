from pathlib import Path
r=Path(__file__).resolve().parents[1]
head='<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024"><rect width="1536" height="1024" fill="white"/><g stroke="#124e57" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">'
def label(x,y,t):return f'<text x="{x}" y="{y}" text-anchor="middle" fill="#124e57" stroke="none" font-family="sans-serif" font-size="42">{t}</text>'
def ball(x,y,t):return f'<circle cx="{x}" cy="{y}" r="46" fill="white"/>'+label(x,y+115,t)
def save(k,s): (r/(k+'-style-a-20261016.svg')).write_text(head+s+'</g></svg>')
s='<path d="M 200 280 H 1336 V 480 H 200 Z" fill="#e4f5ed" stroke="none"/><path d="M 200 490 H 1336" stroke="#b96461" stroke-width="20"/>'+label(768,370,'PA')+ball(510,525,'A')+ball(1020,590,'B')
save('pa-touching-line',s)
s='<path d="M 200 260 H 1336 V 450 Q 768 590 200 450 Z" fill="#e4f5ed" stroke="none"/><path d="M 200 450 Q 768 590 1336 450" fill="none" stroke-dasharray="15 15" stroke="#71ac98"/>'
# Curve at x510 is y505.55; A extends from 479 to571, overlapping the area.
s+=ball(510,525,'A')+ball(1020,635,'B')
save('relief-area-boundary',s)
s='<path d="M 180 650 H 1350" stroke="#9bcdb8"/><path d="M 220 630 Q 550 100 980 630" fill="none" stroke-dasharray="13 14"/><path d="M 980 630 Q 1020 565 1060 630 Q 1080 605 1100 630 L 1290 630" fill="none" stroke="#71ac98"/>'
for x,t in [(220,'A'),(980,'B'),(1290,'C')]:s+=f'<circle cx="{x}" cy="630" r="15" fill="white"/>'+label(x,720,t)
for x1,x2,y in [(220,970,800),(990,1290,800),(220,1290,900)]:s+=f'<path d="M {x1} {y} H {x2} M {x1+14} {y-10} L {x1} {y} {x1+14} {y+10} M {x2-14} {y-10} L {x2} {y} {x2-14} {y+10}" fill="none" stroke="#71ac98"/>'
save('carry-run',s)
