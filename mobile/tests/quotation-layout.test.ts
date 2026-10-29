import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const readSource = (relativePath: string) => readFileSync(
  new URL(`../src/features/new-quotation/${relativePath}`, import.meta.url),
  'utf8',
);

test('o trilho do progresso ocupa toda a largura de cada etapa', () => {
  const styles = readSource('components/ProgressIndicator.styles.ts');
  const progressRow = styles.match(/progressRow:\s*{[^}]*}/)?.[0] ?? '';
  const stepCircleRow = styles.match(/stepCircleRow:\s*{[^}]*}/)?.[0] ?? '';

  assert.match(progressRow, /alignItems:\s*'flex-start'/);
  assert.match(stepCircleRow, /width:\s*'100%'/);
  assert.doesNotMatch(stepCircleRow, /flex:\s*1/);
});

test('o nome da embalagem permanece em uma unica linha sem truncar', () => {
  const screen = readSource('package-selection/index.tsx');

  assert.match(
    screen,
    /<Text\s+adjustsFontSizeToFit\s+minimumFontScale=\{0\.8\}\s+numberOfLines=\{1\}\s+style=/,
  );
});

test('a quantidade e a equivalencia ficam alinhadas a esquerda no resumo', () => {
  const styles = readSource('summary/styles.ts');

  assert.match(styles, /valueGroup:\s*{\s*alignItems:\s*'flex-start'/);
  assert.match(styles, /valueDetail:\s*{[\s\S]*?textAlign:\s*'left'/);
});
