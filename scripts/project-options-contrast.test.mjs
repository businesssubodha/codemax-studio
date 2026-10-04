import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function luminance(hex) {
 const channels = hex.match(/[\da-f]{2}/gi).map(c => parseInt(c, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
 return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) {
 const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
 return (values[0] + 0.05) / (values[1] + 0.05);
}

test('project-option and case-study descriptions meet normal text contrast on their dark background', () => {
 const component = readFileSync(new URL('../src/components/ProjectOptions.astro', import.meta.url), 'utf8');
 const foreground = component.match(/\.section-head>p\{color:(#[\da-f]{6})\}/i)?.[1];
 const scopeColor = component.match(/\.scope-note\{[^}]*color:(#[\da-f]{6})/i)?.[1];
 assert.equal(foreground, '#c4c8bc');
 assert.equal(scopeColor, foreground);
 assert.ok(contrast(foreground, '#111210') >= 4.5);
 // The light-background service sections keep their existing dark text.
 assert.ok(contrast('#55564f', '#f3f2ec') >= 4.5);
 assert.match(component, /<section class="section wrap rebuild"/);
});
