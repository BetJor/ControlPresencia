# **App Name**: Clockwork

## Core Features:

- Real-time Attendance Tracking: Logs employee entries and exits in real-time, updating the Firestore database with timestamp, employee ID, terminal ID, and any associated incident code.
- Master Data Management: Enables administrators to manage master data related to employees, terminals, and incident types directly within the application through dedicated CRUD interfaces.
- User Authentication and Roles: Implements user authentication via Firebase Authentication, including role-based access control (admin vs. standard user) to secure data access and modification.
- Daily Punch Count Calculation: Calculates the number of punches an employee makes during the current day.
- Determine Staff Present: Automatically determines employees who have entered the premises but haven't checked out by assessing whether their punch count for the day is an odd number.
- Personal Dins Display: Create a display, to show Cognoms, Data, Terminal, and the current registry count.

## Style Guidelines:

- Primary color: Dark moderate blue (#546aff) to evoke a sense of reliability.
- Background color: Very light bluish-purple (#f0f2ff) to complement the primary color while maintaining a professional tone.
- Accent color: Strong blue-purple (#7854ff) to bring added emphasis to UI elements without disrupting the application's reliability and usability
- Headline font: 'Space Grotesk' sans-serif for headlines and shorter text amounts. Body font: 'Inter' sans-serif for larger text amounts.
- Simple, modern icons to represent actions and data points throughout the app.
- Clean and structured layout, optimized for data presentation and filtering.
- Subtle transitions and animations to enhance user experience.