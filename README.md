# Party Pal RSVP

🎉 Birthday Party RSVP App — Simple Documentation

1. Purpose

The app will allow invited guests to confirm whether they will attend the birthday party.

Each guest will fill out a simple RSVP form. If they are bringing other people, they can indicate the number of additional guests and provide their details.

The birthday organizer/admin will be able to see the list of people attending and the total number of expected guests.

2. Main Pages

🏠 1. Home Page

A simple birthday invitation page containing:

 Birthday person's name

 Birthday date

 Time

 Venue

 Short birthday message

"RSVP Now" button

Example:

🎂 You’re Invited!
Join us as we celebrate Auntie's Birthday!

📅 Date: 20th October 2026
⏰ Time: 5:00 PM
📍 Venue: [Venue Name]

Please confirm your attendance.

Button:

RSVP NOW

📝 3. RSVP Form

The guest clicks RSVP Now and completes the form.

Guest Information

Full Name

 Text field

 Required

Phone Number

 Phone number field

 Required

Will you be attending?

 ✅ Yes, I'll be there

 ❌ Sorry, I can't make it

If they select No, they can simply submit the form.

4. Additional Guests

If they select Yes, show:

Are you bringing someone with you?

 No

 Yes

If No:

Continue to submission.

If Yes:

Show:

How many additional guests are you bringing?

Example:

Number of additional guests: 2

Then allow them to enter the names.

Additional Guest Details

For example:

Guest 1

 Full Name

Guest 2

 Full Name

There should be an "+ Add Another Guest" button if you want to allow flexible numbers.

📋 5. Confirmation

Before submitting, show a small summary:

RSVP Summary

Name: John Doe
Phone: 055xxxxxxx
Attendance: Yes
Additional Guests: 2
Total People: 3

Button:

Confirm RSVP

✅ 6. Success Page

After submission:

🎉 RSVP Confirmed!

Thank you, John!
We look forward to celebrating with you.

Total guests registered with you: 3

👨‍💼 7. Admin Dashboard

The birthday organizer should have a simple admin dashboard.

Dashboard statistics

Display:

Total RSVPs

Total Attending

Total Not Attending

Total Expected Guests

For example:

StatisticNumberRSVPs45Attending38Not Attending7Total People Coming62

The important distinction is:

Total RSVPs ≠ Total People Coming

Example:

John registers himself + 2 additional guests.

That's:

1 RSVP → 3 people attending

👥 8. Guest List

Admin should see a table like:

NamePhoneAttendingExtra GuestsTotalJohn Doe055xxxYes23Mary Smith024xxxYes01Kwame Mensah020xxxNo00

Admin should be able to:

 Search guests

 View guest details

 Edit RSVP

 Delete RSVP

 Filter Attending / Not Attending

 See total expected guests

📱 9. Mobile Friendly

The app should primarily be designed for mobile phones, since most guests will probably access the RSVP link through WhatsApp.

The RSVP link could be something simple like:

birthday-rsvp.com

or:

yourwebsite.com/rsvp

The organizer can send the link through WhatsApp.

🔐 10. Admin Login

Only the birthday organizer should access the dashboard.

Admin login:

 Email/Username

 Password

Guests do not need to create an account.

They simply open the RSVP link and submit the form.

🗄️ 11. Basic Database Structure

A simple rsvps table could contain:

id
full_name
phone_number
attending
additional_guests
guest_names
created_at
updated_at

Example:

id: 001
full_name: John Doe
phone_number: 0551234567
attending: true
additional_guests: 2
guest_names: ["Mary Doe", "David Doe"]
created_at: ...

⭐ 12. Optional Features

These are not necessary for the first version, but can be added later:

 WhatsApp confirmation

 SMS confirmation

 QR code for the invitation

 Download guest list as Excel/CSV

 Guest check-in at the birthday

 Search guest by phone number

 RSVP closing date

 Custom birthday theme

 Admin notification when someone RSVPs

Simple MVP

For the first version, I would build only:

Home → RSVP Form → Confirmation → Admin Dashboard → Guest List

That is enough to solve your sister's problem without making the app unnecessarily complicated.




jusT a simple and a responsive site please 

background should be light theme color design black and blue

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/47bdf890-4824-4a50-a761-19eaa88038da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
