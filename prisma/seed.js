/**
 * prisma/seed.js  — plain JavaScript, no ts-node required
 *
 * Run:  node prisma/seed.js
 * Or via package.json prisma.seed script (see below)
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(Math.floor(Math.random() * 18) + 6, Math.floor(Math.random() * 60), 0, 0)
  return d
}

function futureDays(n) {
  return new Date(Date.now() + n * 86_400_000)
}

// ── Users ─────────────────────────────────────────────────────────────────────

const FACULTY_USERS = [
  { name: 'Dr. Priya Sharma',  email: 'priya.sharma@university.edu' },
  { name: 'Prof. Arjun Mehta', email: 'arjun.mehta@university.edu'  },
]

const STUDENT_USERS = [
  { name: 'Aarav Patel',      email: 'aarav.patel@student.edu'     },
  { name: 'Sneha Reddy',      email: 'sneha.reddy@student.edu'     },
  { name: 'Rohan Gupta',      email: 'rohan.gupta@student.edu'     },
  { name: 'Meera Iyer',       email: 'meera.iyer@student.edu'      },
  { name: 'Kabir Singh',      email: 'kabir.singh@student.edu'     },
  { name: 'Ananya Nair',      email: 'ananya.nair@student.edu'     },
  { name: 'Vikram Joshi',     email: 'vikram.joshi@student.edu'    },
  { name: 'Divya Pillai',     email: 'divya.pillai@student.edu'    },
  { name: 'Aryan Kapoor',     email: 'aryan.kapoor@student.edu'    },
  { name: 'Pooja Desai',      email: 'pooja.desai@student.edu'     },
  { name: 'Nikhil Rao',       email: 'nikhil.rao@student.edu'      },
  { name: 'Ishaan Verma',     email: 'ishaan.verma@student.edu'    },
  { name: 'Tanvi Sharma',     email: 'tanvi.sharma@student.edu'    },
  { name: 'Aditya Kumar',     email: 'aditya.kumar@student.edu'    },
  { name: 'Riya Mishra',      email: 'riya.mishra@student.edu'     },
  { name: 'Siddharth Bose',   email: 'siddharth.bose@student.edu'  },
  { name: 'Nisha Chatterjee', email: 'nisha.chat@student.edu'      },
  { name: 'Harsh Malhotra',   email: 'harsh.malhotra@student.edu'  },
  { name: 'Priti Saxena',     email: 'priti.saxena@student.edu'    },
  { name: 'Rahul Tiwari',     email: 'rahul.tiwari@student.edu'    },
]

// ── Notices ───────────────────────────────────────────────────────────────────

const NOTICES = [
  // Exam (8)
  {
    title: 'Mid-Semester Examination Schedule — November 2024',
    body: 'The mid-semester examinations will be held from November 18–25. All students must carry their hall tickets. No entry will be permitted without a valid ID card. Seating arrangements will be posted on the notice board 48 hours before each paper.',
    category: 'Exam', priority: 'URGENT', isPinned: true, daysOld: 1, expiresInDays: 20,
  },
  {
    title: 'Practical Examination Timetable — CS & IT Departments',
    body: 'Practical examinations for Computer Science and Information Technology students are scheduled for the last week of November. Students must submit their lab journals to the department office before appearing.',
    category: 'Exam', priority: 'HIGH', isPinned: false, daysOld: 3, expiresInDays: 18,
  },
  {
    title: 'Re-examination Application Window Open',
    body: 'Students who were absent during the previous semester examinations due to medical reasons may apply for re-examination. Applications must be submitted with a medical certificate within 7 days.',
    category: 'Exam', priority: 'HIGH', isPinned: false, daysOld: 4, expiresInDays: 7,
  },
  {
    title: 'Internal Assessment Marks Displayed on Portal',
    body: 'Internal assessment marks for all subjects have been uploaded to the student portal. Students who wish to raise a discrepancy must contact their respective department coordinators within 3 working days.',
    category: 'Exam', priority: 'NORMAL', isPinned: false, daysOld: 5, expiresInDays: null,
  },
  {
    title: 'End-Semester Exam Hall Ticket Download',
    body: 'Hall tickets for the end-semester examinations are now available for download on the student portal. Ensure your fee dues are cleared before downloading. Contact the examination cell for any discrepancies.',
    category: 'Exam', priority: 'URGENT', isPinned: true, daysOld: 2, expiresInDays: 15,
  },
  {
    title: 'Supplementary Exam Results Declared',
    body: 'Results for the supplementary examinations held in October have been declared. Students can view their results on the university portal. Those who have passed may collect their mark sheets from the registrar\'s office.',
    category: 'Exam', priority: 'NORMAL', isPinned: false, daysOld: 7, expiresInDays: null,
  },
  {
    title: 'Grace Marks Policy Update for Current Semester',
    body: 'The Academic Council has revised the grace marks policy for the current semester. A maximum of 5 grace marks will be awarded per subject, subject to eligibility. Refer to the updated policy document on the portal.',
    category: 'Exam', priority: 'HIGH', isPinned: false, daysOld: 9, expiresInDays: null,
  },
  {
    title: 'Question Paper Pattern Changed — Mathematics III',
    body: 'The question paper pattern for Mathematics III has been revised as per the updated syllabus. The paper will now carry 80 marks with an internal choice in each section. Refer to the new blueprint shared on the portal.',
    category: 'Exam', priority: 'NORMAL', isPinned: false, daysOld: 11, expiresInDays: null,
  },

  // Event (7)
  {
    title: 'Annual Tech Fest "InnovatX 2024" — Registration Open',
    body: 'The flagship annual tech fest InnovatX 2024 is back! Register for hackathons, coding competitions, robotics challenges, and paper presentations. Early-bird registration closes November 10. Teams of 2–4 members are eligible.',
    category: 'Event', priority: 'HIGH', isPinned: true, daysOld: 2, expiresInDays: 12,
  },
  {
    title: 'Guest Lecture: AI in Healthcare by Dr. Kavita Rao',
    body: 'The Department of Computer Science invites all students to an enlightening guest lecture on Artificial Intelligence applications in Healthcare, delivered by Dr. Kavita Rao from IIT Delhi. Attendance is open to all branches.',
    category: 'Event', priority: 'NORMAL', isPinned: false, daysOld: 3, expiresInDays: 5,
  },
  {
    title: 'Cultural Fest "Utsav 2024" — Volunteer Registration',
    body: 'Volunteers are needed for the upcoming Cultural Fest Utsav 2024. Roles include stage management, hospitality, event coordination, and media coverage. Interested students can register via the student portal by November 8.',
    category: 'Event', priority: 'NORMAL', isPinned: false, daysOld: 5, expiresInDays: 8,
  },
  {
    title: 'Industry-Academia Meet — November 15',
    body: 'Top companies from the IT and manufacturing sectors will participate in the Industry-Academia Meet on November 15. Students in their final year are encouraged to bring their portfolios for informal interactions with HR representatives.',
    category: 'Event', priority: 'HIGH', isPinned: false, daysOld: 6, expiresInDays: 10,
  },
  {
    title: 'Workshop on Competitive Programming — Nov 12 & 13',
    body: 'A two-day intensive workshop on Competitive Programming will be conducted by the Coding Club. Topics covered: Dynamic Programming, Graph Algorithms, and Segment Trees. Limited seats — register on the portal before November 9.',
    category: 'Event', priority: 'NORMAL', isPinned: false, daysOld: 8, expiresInDays: 6,
  },
  {
    title: 'Entrepreneurship Cell — Startup Pitch Competition',
    body: 'The E-Cell is hosting its annual Startup Pitch Competition. Present your business idea to a panel of investors and industry mentors. Pre-registration mandatory. Winners receive seed funding and mentorship opportunities.',
    category: 'Event', priority: 'HIGH', isPinned: false, daysOld: 10, expiresInDays: 14,
  },
  {
    title: 'Photography Exhibition — "Campus Through a Lens"',
    body: 'The Fine Arts Club presents a photography exhibition featuring student captures of campus life. Entry is free and open to all. Voting for the People\'s Choice Award will be held on the spot. Venue: Main Foyer, Block A.',
    category: 'Event', priority: 'LOW', isPinned: false, daysOld: 12, expiresInDays: null,
  },

  // Academic (6)
  {
    title: 'Revised Academic Calendar for Odd Semester 2024–25',
    body: 'The revised academic calendar for the odd semester 2024–25 has been approved by the Academic Council. Key changes include the rescheduling of mid-semester holidays and the addition of remedial classes in December.',
    category: 'Academic', priority: 'HIGH', isPinned: true, daysOld: 1, expiresInDays: null,
  },
  {
    title: 'New Elective Course: Cloud Computing and DevOps',
    body: 'A new elective course on Cloud Computing and DevOps is being introduced for sixth-semester students from January. Students must opt in through the portal by November 20. Seats are limited to 60 per batch.',
    category: 'Academic', priority: 'NORMAL', isPinned: false, daysOld: 4, expiresInDays: 25,
  },
  {
    title: 'Attendance Shortage Warning — November 2024',
    body: 'Students with attendance below 75% as of October 31 have been identified. A detailed list is posted on departmental notice boards. Affected students must meet their faculty advisors immediately to avoid examination debarment.',
    category: 'Academic', priority: 'URGENT', isPinned: false, daysOld: 6, expiresInDays: null,
  },
  {
    title: 'Library Extended Hours During Exam Period',
    body: 'The central library will remain open until 11 PM from November 15 to November 30 to support students preparing for end-semester examinations. Additional reading rooms on the third floor will also be accessible.',
    category: 'Academic', priority: 'NORMAL', isPinned: false, daysOld: 8, expiresInDays: 20,
  },
  {
    title: 'Project Submission Deadline — Final Year Students',
    body: 'Final year students must submit their project reports and source code to their respective project guides by November 22. A soft copy must also be uploaded to the portal. Late submissions will attract a penalty.',
    category: 'Academic', priority: 'HIGH', isPinned: false, daysOld: 9, expiresInDays: 12,
  },
  {
    title: 'Anti-Ragging Awareness Campaign — Mandatory Participation',
    body: 'All students are required to complete the online anti-ragging module available on the student portal. Completion is mandatory for examination registration. The deadline is November 30.',
    category: 'Academic', priority: 'URGENT', isPinned: false, daysOld: 13, expiresInDays: null,
  },

  // General (5)
  {
    title: 'Campus Wi-Fi Upgrade — Scheduled Downtime November 10',
    body: 'The IT department will be upgrading the campus Wi-Fi infrastructure on November 10 between 2 AM and 6 AM. All wireless services will be unavailable during this window. Wired connections in labs will remain operational.',
    category: 'General', priority: 'NORMAL', isPinned: false, daysOld: 3, expiresInDays: null,
  },
  {
    title: 'Canteen Menu Update — New Healthy Options Added',
    body: 'The university canteen has added new healthy meal options to its menu starting this week. These include a salad bar, multigrain options, and fresh juice counters. Feedback can be submitted to the Student Welfare Office.',
    category: 'General', priority: 'LOW', isPinned: false, daysOld: 7, expiresInDays: null,
  },
  {
    title: 'ID Card Renewal — Mandatory for All Students',
    body: 'All students whose ID cards expire in December 2024 must renew them before November 30. Renewal forms are available at the administrative office. Bring two passport-sized photographs and a copy of your fee receipt.',
    category: 'General', priority: 'HIGH', isPinned: false, daysOld: 5, expiresInDays: 30,
  },
  {
    title: 'Emergency Contact Update Request',
    body: 'The university administration requests all students to update their emergency contact information on the student portal. This is essential for communication during unforeseen circumstances. Deadline: November 15.',
    category: 'General', priority: 'NORMAL', isPinned: false, daysOld: 10, expiresInDays: 15,
  },
  {
    title: 'Hostel Mess Feedback Survey — November 2024',
    body: 'The Hostel Management Committee invites all hostel residents to fill in the monthly mess feedback survey on the portal. Your feedback helps improve meal quality and hygiene standards. The survey closes November 12.',
    category: 'General', priority: 'LOW', isPinned: false, daysOld: 12, expiresInDays: null,
  },

  // Sports (4)
  {
    title: 'Inter-College Cricket Tournament — Team Selection Trials',
    body: 'Trials for the university cricket team will be held on November 9 at the main ground. Students interested in representing the university in the inter-college tournament must report by 7 AM with their sports kit.',
    category: 'Sports', priority: 'NORMAL', isPinned: false, daysOld: 4, expiresInDays: 6,
  },
  {
    title: 'Annual Sports Day — Registration for Track Events',
    body: 'Annual Sports Day is scheduled for November 20. Students can register for 100m, 200m, 400m, relay, long jump, and shot put events via the portal. Registration closes November 14. Participation certificates will be awarded to all.',
    category: 'Sports', priority: 'NORMAL', isPinned: false, daysOld: 6, expiresInDays: 14,
  },
  {
    title: 'New Gym Equipment Installed — Fitness Centre Open Extended Hours',
    body: 'The university fitness centre has been upgraded with new equipment including treadmills, weight machines, and a yoga studio. From November 1, the centre will be open from 5:30 AM to 9 PM on all working days.',
    category: 'Sports', priority: 'LOW', isPinned: false, daysOld: 9, expiresInDays: null,
  },
  {
    title: 'Basketball Court Renovation — Temporary Closure',
    body: 'The outdoor basketball court will be closed for renovation from November 11 to November 18. Students may use the indoor court in Block C gymnasium during this period. We apologise for the inconvenience.',
    category: 'Sports', priority: 'NORMAL', isPinned: false, daysOld: 11, expiresInDays: 8,
  },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting full demo seed…')

  // 1. Clear existing data
  await prisma.notification.deleteMany()
  await prisma.noticeView.deleteMany()
  await prisma.bookmark.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.user.deleteMany()
  console.log('✓  Cleared existing data')

  // 2. Hash password once
  const hashedPw = await bcrypt.hash('password123', 10)

  // 3. Create faculty
  const faculty = []
  for (let i = 0; i < FACULTY_USERS.length; i++) {
    const f = await prisma.user.create({
      data: {
        name: FACULTY_USERS[i].name,
        email: FACULTY_USERS[i].email,
        password: hashedPw,
        role: 'FACULTY',
        createdAt: daysAgo(30 - i * 5),
      },
    })
    faculty.push(f)
  }
  console.log(`✓  Created ${faculty.length} faculty users`)

  // 4. Create students
  const students = []
  for (let i = 0; i < STUDENT_USERS.length; i++) {
    const s = await prisma.user.create({
      data: {
        name: STUDENT_USERS[i].name,
        email: STUDENT_USERS[i].email,
        password: hashedPw,
        role: 'STUDENT',
        createdAt: daysAgo(Math.floor(i * 1.5)),
      },
    })
    students.push(s)
  }
  console.log(`✓  Created ${students.length} student users`)

  // 5. Create notices
  const notices = []
  for (let i = 0; i < NOTICES.length; i++) {
    const n = NOTICES[i]
    const author = faculty[i % faculty.length]
    const createdAt = daysAgo(n.daysOld)
    const expiresAt = n.expiresInDays ? futureDays(n.expiresInDays) : null

    const notice = await prisma.notice.create({
      data: {
        title: n.title,
        body: n.body,
        category: n.category,
        priority: n.priority,
        isPinned: n.isPinned,
        expiresAt,
        publishDate: createdAt,
        authorId: author.id,
        viewCount: 0,
        createdAt,
        updatedAt: createdAt,
      },
    })
    notices.push(notice)
  }
  console.log(`✓  Created ${notices.length} notices`)

  // 6. Create views (~75% of notices per student, spread over last 7 days)
  let viewCount = 0
  for (const student of students) {
    for (const notice of notices) {
      if (Math.random() < 0.75) {
        await prisma.noticeView.create({
          data: {
            noticeId: notice.id,
            studentId: student.id,
            viewedAt: daysAgo(Math.floor(Math.random() * 7)),
          },
        })
        viewCount++
      }
    }
  }

  // Update denormalised viewCount
  for (const notice of notices) {
    const count = await prisma.noticeView.count({ where: { noticeId: notice.id } })
    await prisma.notice.update({ where: { id: notice.id }, data: { viewCount: count } })
  }
  console.log(`✓  Created ${viewCount} notice views`)

  // 7. Create bookmarks (2–5 per student)
  let bookmarkCount = 0
  for (const student of students) {
    const shuffled = [...notices].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < count && i < shuffled.length; i++) {
      try {
        await prisma.bookmark.create({
          data: {
            noticeId: shuffled[i].id,
            userId: student.id,
            createdAt: daysAgo(Math.floor(Math.random() * 7)),
          },
        })
        bookmarkCount++
      } catch (_) {
        // skip duplicate
      }
    }
  }
  console.log(`✓  Created ${bookmarkCount} bookmarks`)

  // 8. Create notifications (pinned + 3 random per student)
  const pinnedNotices = notices.filter((n) => n.isPinned)
  let notifCount = 0
  for (const student of students) {
    const random = [...notices].sort(() => Math.random() - 0.5).slice(0, 3)
    const toNotify = [...new Map([...pinnedNotices, ...random].map((n) => [n.id, n])).values()]

    for (const notice of toNotify) {
      await prisma.notification.create({
        data: {
          userId: student.id,
          noticeId: notice.id,
          message: `New notice: ${notice.title.slice(0, 60)}${notice.title.length > 60 ? '…' : ''}`,
          read: Math.random() > 0.4,
          createdAt: daysAgo(Math.floor(Math.random() * 5)),
        },
      })
      notifCount++
    }
  }
  console.log(`✓  Created ${notifCount} notifications`)

  console.log('\n✅  Seed complete!')
  console.log(`   Faculty   : ${faculty.length}`)
  console.log(`   Students  : ${students.length}`)
  console.log(`   Notices   : ${notices.length}`)
  console.log(`   Views     : ${viewCount}`)
  console.log(`   Bookmarks : ${bookmarkCount}`)
  console.log(`   Notifs    : ${notifCount}`)
  console.log('\n   All accounts → password: password123')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())