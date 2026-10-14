import { expect, test } from '@playwright/test';

test('parcours complet avec reprise après actualisation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await page.getByRole('radio', { name: /Tika/ }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await page.getByRole('button', { name: /parti/ }).click();

  await page.getByRole('button', { name: 'Aventures' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Préparer mon sac' }).getByRole('button', { name: 'Lancer' }).click();
  await page.getByRole('button', { name: /C.est fait/ }).click();
  await expect(page.getByText('+10 XP')).toBeVisible();
  await page.getByRole('button', { name: /suivante/ }).click();
  await page.getByRole('button', { name: /C.est fait/ }).click();

  // Fermeture / actualisation au milieu de la routine
  await page.reload();
  await expect(page.getByText('Ta quête en cours')).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre' }).click();
  await expect(page.getByText('Étape 3 sur 6')).toBeVisible();

  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: /C.est fait/ }).click();
    if (i < 3) await page.getByRole('button', { name: /suivante/ }).click();
  }
  await expect(page.getByText(/XP gagnés/)).toBeVisible();
  await expect(page.getByText('Niveau 2 !')).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Niveau 2')).toBeVisible();
  expect(errors).toEqual([]);
});
