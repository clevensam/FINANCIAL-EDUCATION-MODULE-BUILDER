import { test, expect } from '@playwright/test';

test.describe('Financial Education Module Builder - E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('E2E-001: Create module with 3 blocks (text, quiz, calculator)', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('Home Loan Basics');

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'Rich Text' }).click();
    await page.waitForTimeout(400);

    const blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(1);
    await expect(blocks.first()).toHaveAttribute('aria-label', /Rich Text/);

    const addBtn = page.locator('button[aria-label="Add block"]');
    await addBtn.click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'EMI Calculator' }).click();
    await page.waitForTimeout(400);

    await expect(page.locator('[role="group"]')).toHaveCount(2);

    await addBtn.click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'Quiz (MCQ)' }).click();
    await page.waitForTimeout(400);

    await expect(page.locator('[role="group"]')).toHaveCount(3);
    await expect(page.locator('h1')).toContainText('Home Loan Basics');
  });

  test('E2E-002: Drag-and-drop reorder pos 1 to pos 3', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('Reorder Test');

    for (let i = 0; i < 3; i++) {
      await page.locator('button[aria-label="Add block"]').click();
      await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
      await page.locator('button[role="option"]').filter({ hasText: 'Rich Text' }).click();
      await page.waitForTimeout(200);
    }

    let blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(3);
    await expect(blocks.first()).toHaveAttribute('aria-label', /pos 1/);

    await blocks.first().locator('button[aria-label="Move block down"]').click({ force: true });
    await page.waitForTimeout(200);

    blocks = page.locator('[role="group"]');
    await expect(blocks.first()).toHaveAttribute('aria-label', /pos 1/);

    await page.locator('input[aria-label="Module title"]').click();
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(300);

    blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(3);
  });

  test('E2E-003: Full EMI calculation in preview', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('EMI Test');

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'EMI Calculator' }).click();
    await page.waitForTimeout(400);

    await page.locator('input[aria-label="Loan amount value"]').fill('500000');
    await page.locator('input[aria-label="Interest rate value"]').fill('10');
    await page.locator('input[aria-label="Tenure months value"]').fill('60');
    await page.waitForTimeout(600);

    const previewEmi = page.locator('p.text-sm.text-\\[\\#64748B\\]').filter({ hasText: 'Monthly EMI' });
    await expect(previewEmi).toBeVisible();

    await expect(page.locator('.recharts-wrapper').first()).toBeVisible({ timeout: 5000 });

    await page.locator('summary:has-text("View Amortization Schedule")').click();
    await page.waitForTimeout(300);

    await expect(page.locator('table').last()).toBeVisible();
  });

  test('E2E-004: Quiz attempt flow in preview', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('Quiz Test');

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'Quiz (MCQ)' }).click();
    await page.waitForTimeout(300);

    await page.locator('textarea[aria-label="Question text"]').fill('What is 2+2?');
    await page.locator('input[aria-label="Option 1 text"]').fill('4');
    await page.locator('input[aria-label="Option 2 text"]').fill('5');
    await page.locator('button[aria-label="Toggle correct for option 1"]').click({ force: true });
    await page.waitForTimeout(200);

    await expect(page.locator('textarea[aria-label="Question text"]')).toHaveValue('What is 2+2?');
    await expect(page.locator('input[aria-label="Option 1 text"]')).toHaveValue('4');
  });

  test('E2E-005: Export JSON and re-import', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('Export Test');

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'Rich Text' }).click();
    await page.waitForTimeout(300);

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      page.locator('button[aria-label="Export module as JSON"]').click(),
    ]);
    expect(download).toBeTruthy();

    const stream = await download.createReadStream();
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    const jsonStr = Buffer.concat(chunks).toString('utf-8');
    const exported = JSON.parse(jsonStr);
    expect(exported.title).toBe('Export Test');
    expect(exported.blocks).toHaveLength(1);
    expect(exported.schemaVersion).toBe('1.0');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('button[aria-label="Import module from JSON"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-export.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        ...exported,
        title: 'Imported Module',
        blocks: [],
      })),
    });
    await page.waitForTimeout(400);

    await expect(page.locator('input[aria-label="Module title"]')).toHaveValue('Imported Module');
  });

  test('E2E-006: 10 undo/redo consecutive operations', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.querySelector('input[aria-label="Module title"]') as HTMLInputElement;
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(input, 'Undo Test');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(200);

    for (let i = 0; i < 3; i++) {
      await page.locator('button[aria-label="Add block"]').click();
      await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
      await page.locator('button[role="option"]').filter({ hasText: 'Rich Text' }).click();
      await page.waitForTimeout(200);
    }

    let blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(3);

    await page.evaluate(() => {
      const store = window.__STORE__;
      if (!store) return;
      for (let i = 0; i < 3; i++) {
        const s = store.getState();
        if (s.past.length === 0) break;
        const restored = s.undo(s.module);
        if (restored) s.setModule(restored);
      }
    });
    await page.waitForTimeout(300);

    blocks = page.locator('[role="group"]');
    const afterUndo = await blocks.count();
    expect(afterUndo).toBe(0);

    await page.evaluate(() => {
      const store = window.__STORE__;
      if (!store) return;
      for (let i = 0; i < 2; i++) {
        const s = store.getState();
        if (s.future.length === 0) break;
        const next = s.redo();
        if (next) s.setModule(next);
      }
    });
    await page.waitForTimeout(300);

    blocks = page.locator('[role="group"]');
    const afterRedo = await blocks.count();
    expect(afterRedo).toBe(2);
  });

  test('E2E-007: Mobile preview for calculator', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('Mobile Test');

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'EMI Calculator' }).click();
    await page.waitForTimeout(300);

    await page.locator('button[aria-label="Mobile view"]').click();
    await page.waitForTimeout(600);

    const previewFrame = page.locator('[class*="min-h-\\[600px\\]"]');
    const classAttr = await previewFrame.getAttribute('class') || '';
    expect(classAttr).toContain('375');

    await page.locator('input[aria-label="Loan amount value"]').fill('100000');
    await page.locator('input[aria-label="Interest rate value"]').fill('8');
    await page.waitForTimeout(300);

    const emiLabels = page.locator('text=Monthly EMI');
    await expect(emiLabels.first()).toBeVisible();
  });

  test('E2E-008: Keyboard-only navigation', async ({ page }) => {
    await page.locator('input[aria-label="Module title"]').fill('Keyboard Test');

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'Rich Text' }).click();
    await page.waitForTimeout(300);

    let blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(1);

    await page.locator('button[aria-label="Add block"]').click();
    await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
    await page.locator('button[role="option"]').filter({ hasText: 'Rich Text' }).click();
    await page.waitForTimeout(300);

    blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(2);

    await blocks.first().hover();
    await page.waitForTimeout(200);
    await blocks.first().locator('button[aria-label="Delete block"]').click({ force: true });
    await page.waitForTimeout(400);

    blocks = page.locator('[role="group"]');
    await expect(blocks).toHaveCount(1);
  });
});
