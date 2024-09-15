import { test } from '@playwright/test';

test('book court', async ({ page }) => {
  // Login
  await page.goto('/login/credentials');
  await page.getByPlaceholder('Username').fill(process.env.USERNAME);
  await page.getByPlaceholder('Password').fill(process.env.PASSWORD);
  await page.locator('[type=submit]').click();

  // Book
  await page.locator('[href="/bookings"]').last().click();

  // Cycle through days, till the next instance of our booking day is found.
  let foundDay = false
  while (!foundDay) {
    await page.locator('.BookingGridNav button').last().click(); // Next day button.
    foundDay = (await page.locator('.BookingGridNav-date').first().textContent()).includes(process.env.BOOKING_DAY)
  }

  // Book slots.
  await bookSlots({
    page, startTime:
    process.env.BOOKING_TIME_START,
    endTime: process.env.BOOKING_TIME_END,
    uncheckConfirmationEmail: false
  });
  await bookSlots({
    page, startTime:
    process.env.BOOKING_TIME_START_2,
    endTime: process.env.BOOKING_TIME_END_2,
    uncheckConfirmationEmail: true
  });
});

async function bookSlots({ page, startTime, endTime, uncheckConfirmationEmail }) {
  await page.getByText(startTime).nth(process.env.BOOKING_COURT - 1).click();
  await page.getByText(endTime).nth(process.env.BOOKING_COURT - 1).click();

  await page.getByText('Practice').click();
  await page.getByText('Next').click();
  await page.getByText(/I agree/i).click();

  if (uncheckConfirmationEmail) {
    await page.getByText(/confirmation email/i).click();
  }

  return page.getByText('Confirm booking').click();
}

/**
 * Hold the browser open.
 *
 * ```
 * await pause();
 * ```
 */
function pause() {
  console.log('Pausing');
  return new Promise(() => {});
}