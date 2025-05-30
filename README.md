# Project Name

A [Playwright](https://playwright.dev/) for creating recurring weekly bookings in 
[HelloClub](https://helloclub.com/) with a standard HelloClub user account.

Currently, hardcoded to use Facebook login, but it can be adapted to use other login methods.
For social auth you will almost certainly need to run locally (due to bot, prevention measures).
but with username and password you may be able to run in CI.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)
- [cron](https://en.wikipedia.org/wiki/Cron)

## Local installation and setup

### Install dependencies
```bash
npm ci
npx playwright install chromium
```

### Configure the recurring booking
Create an `.env` file in the root directory of the project.
This file will contain your HelloClub credentials and booking details.
```bash
touch .env;
```
Possible keys for the `.env` file are:
```env
BASE_URL
HC_USERNAME
BOOKING_DAY
BOOKING_TIME_START
BOOKING_TIME_END
BOOKING_TIME_START_2
BOOKING_TIME_END_2
BOOKING_COURT
PASSWORD
```

There is also a sample `.env.defaults` file that you can use as a reference.

### Configure the cron job
Make the entry point script executable:
```bash
chmod +x book.sh
```

There is an example cron job file in .crontab.
The important part is to set the time to 8am nz on the day you want to book the court.
8am is the cutover to allow bookings for the next week.

The script needs to point to this repo and optionally a log file.
The sample assumes this repo is cloned to `~/code`.

### Working around facebook login bot prevention
You may want to pre-login to HelloClub using a browser and save the session cookies.
```bash
chmod +x launch-crome.sh;
./launch-chrome.sh;
```
I like to do this the day before the cron job run each week.