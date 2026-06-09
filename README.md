# NoticeBoard

A full-stack Notice Board application built with Next.js, Prisma, and MySQL.
Live demo: (add your Vercel URL after deploying)

## Features
- Create, read, update, and delete notices
- Categories: Exam, Event, General
- Priority: Urgent notices appear at the top with a red badge
- Responsive on mobile and desktop
- Server-side validation on all API routes

## How to run locally

1. Clone the repository
   git clone https://github.com/Abhinandan-Maurya85/notice-board.git
   cd notice-board

2. Install dependencies
   npm install


4. Run Prisma migrations
   npx prisma migrate dev

5. Start the development server
   npm run dev

6. Open http://localhost:3000

## One thing I would improve with more time
I would add user authentication so only authorized staff can post,
edit, or delete notices, while students can only view them.



## How AI was used
AI was used to help with styling, component structure, and debugging
CSS layout issues. All logic, API routes, and database schema were
written and understood by me.