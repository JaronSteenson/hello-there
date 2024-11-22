import { test } from '@playwright/test';

/**
 * `0 12 * * 7` At 12:00 PM, only on Sunday.
 * Accounting for timezones and assuming we are running in utc, means 12am Monday night NZ time.
 */
test('book court', async ({ page }) => {
  await login({ page });

  await findBookingDay({ page });

  await bookSlots({
    page,
    startTime: process.env.BOOKING_TIME_START,
    endTime: process.env.BOOKING_TIME_END,
  });

  await wait(1000);

  await bookSlots({
    page,
    startTime: process.env.BOOKING_TIME_START_2,
    endTime: process.env.BOOKING_TIME_END_2,
    uncheckConfirmationEmail: true,
    singleClickBooking: true,
  });
});

async function login({ page }) {
  console.log(
      'Logging into Facebook as',
      process.env.HC_USERNAME,
      Array.from({ length: process.env.PASSWORD.length }).fill('*').join('')
  );
  await page.goto('');
  await page.getByText(/Facebook/i).click();

  // As generic as possible, so work on all auth providers.
  await page.locator('[name=email], [name=text]').fill(process.env.PASSWORD);
  await page.getByPlaceholder('Password').fill(process.env.HC_USERNAME);
  await page.screenshot();
  await page.locator('[type=submit]').click();
  await page.getByText(/Continue as/i).click({ timeout: 30_000 }); // Might have to wait for me to approve on my phone.
}

async function findBookingDay({ page }) {
  console.log('Finding booking day', process.env.BOOKING_DAY);
  await page.getByText(/Bookings/i).first().click({ timeout: 30_000 }); // Super slow to load.

  // Click to the next day immediately so we don't try to book for today.
  await page.locator('.BookingGridNav button').last().click({ timeout: 30_000 }); // Another slow loader.

  // Cycle through days, till the next instance of our booking day is found.
  let foundDay = false
  let previousDate = ''
  while (!foundDay) {
    await page.locator('.BookingGridNav button').last().click(); // Next day button.
    const currentDate = (await page.locator('.BookingGridNav-date').first().textContent());

    if (currentDate.includes(process.env.BOOKING_DAY)) {
      return;
    }

    if (previousDate === currentDate) {
      throw new Error(`Unable to go to next instance of ${process.env.BOOKING_DAY}, spec probably run too early`);
    }

    previousDate = currentDate;
  }
}

async function bookSlots({ page, startTime, endTime, uncheckConfirmationEmail = false, singleClickBooking = false }) {
  console.log('Booking slot', startTime, endTime);
  const courtColumn = process.env.BOOKING_COURT - 1;

  const start = page.locator('.BookingGrid').last().locator('.BookingGrid-column').nth(courtColumn).getByText(startTime).last();
  await start.scrollIntoViewIfNeeded();
  await start.click();
  console.log('Start time clicked', startTime);

  if (singleClickBooking) {
    // I think back to back bookings in peak hits the total time limit and causes the booking form to open on start time click.
    console.log('Skipping end time click, single click booking');
  } else {
    const end = page.locator('.BookingGrid').last().locator('.BookingGrid-column').nth(courtColumn).getByText(endTime).last();
    await end.scrollIntoViewIfNeeded();
    await end.click();
    console.log('End time clicked', endTime);
  }

  console.log('Submitting practice form');
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
function wait(ms) {
  console.log('Waiting', ms ?? 'indefinitely');
  return new Promise(ms ? resolve => setTimeout(resolve, ms) : () => {});
}
