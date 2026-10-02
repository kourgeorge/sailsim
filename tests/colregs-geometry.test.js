import test from 'node:test';
import assert from 'node:assert/strict';
import { renderColregsFigure } from '../src/learning/colregs-figures.js';

const vessels = (svg) =>
  [
    ...svg.matchAll(
      /<g data-vessel="([AB])" data-heading="([\d.]+)"(?: data-tack="(port|starboard)")?(?: data-propulsion="engine")? transform="translate\(([\d.]+) ([\d.]+)\)/g,
    ),
  ].map(([, id, heading, tack, x, y]) => ({ id, heading: +heading, tack, x: +x, y: +y }));
const relative = (from, to) =>
  (((Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI - from.heading + 540) % 360) - 180;

test('sailing encounter geometry agrees with tack and does not inadvertently depict overtaking', () => {
  for (const variant of ['sailing', 'same-tack']) {
    const svg = renderColregsFigure({ id: 'sail-46' }, 'en', { variant });
    const boats = vessels(svg);
    assert.equal(boats.length, 2);
    for (const boat of boats) {
      const windAngle = ((-boat.heading + 540) % 360) - 180;
      assert.equal(boat.tack, windAngle < 0 ? 'port' : 'starboard');
      assert.ok(
        Math.abs(
          relative(
            boat,
            boats.find((other) => other !== boat),
          ),
        ) <= 112.5,
        `${variant}/${boat.id}: other boat is not in the overtaking sector`,
      );
    }
    assert.match(svg, /data-mainsail-side="port"/);
    if (variant === 'sailing') assert.match(svg, /data-mainsail-side="starboard"/);
  }
});

test('overtaking and crossing diagrams preserve the stated physical relationships in RTL', () => {
  for (const lang of ['en', 'he', 'ar', 'es', 'ru', 'fr']) {
    const overtake = vessels(renderColregsFigure({ id: 'sail-46' }, lang, { variant: 'overtake' }));
    assert.ok(
      Math.abs(
        relative(
          overtake.find((b) => b.id === 'B'),
          overtake.find((b) => b.id === 'A'),
        ) - 120,
      ) < 0.1,
    );
    const crossing = vessels(renderColregsFigure({ id: 'sail-47' }, lang, { variant: 'crossing' }));
    const a = crossing.find((b) => b.id === 'A'),
      b = crossing.find((b) => b.id === 'B');
    assert.ok(relative(a, b) > 0, 'B is on A’s starboard');
    assert.ok(relative(b, a) < 0, 'A is on B’s port');
    assert.deepEqual(
      crossing,
      vessels(renderColregsFigure({ id: 'sail-47' }, 'en', { variant: 'crossing' })),
    );
  }
});
