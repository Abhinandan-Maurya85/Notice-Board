export default function About() {
 return (
   <>
     <section className="about-hero">
       <div className="hero-shapes">
         <div className="shape shape-1" />
         <div className="shape shape-2" />
         <div className="shape shape-3" />
       </div>
       <div className="hero-content">
         <div className="hero-badge">ℹ️ About Us</div>
         <h1 className="hero-title">About NoticeBoard</h1>
         <p className="hero-sub">
           Your one-stop platform for all official announcements,
           exam schedules, and campus events — in real time.
         </p>
       </div>
     </section>

     <div className="about-card-full">
       <h2>What is NoticeBoard?</h2>
       <p>
         NoticeBoard is a centralized digital announcement platform built to keep
         students, faculty, and staff informed about everything happening on campus.
         From exam timetables to urgent fee deadlines and cultural events — it all
         lives here in one place.
       </p>
       <p>
         No more missing important deadlines or scrolling through WhatsApp groups.
         Every official notice is posted here the moment it is released.
       </p>
     </div>

     <div className="features-grid">
       <div className="feature-item">
         <span className="feature-item-icon">📢</span>
         <h3>Instant announcements</h3>
         <p>Notices go live the moment they are posted by an admin.</p>
       </div>
       <div className="feature-item">
         <span className="feature-item-icon">🔍</span>
         <h3>Powerful search</h3>
         <p>Find any notice instantly by searching title or content.</p>
       </div>
       <div className="feature-item">
         <span className="feature-item-icon">🏷️</span>
         <h3>Smart categories</h3>
         <p>Filter by Urgent, Exam, Event, or General in one click.</p>
       </div>
       <div className="feature-item">
         <span className="feature-item-icon">📅</span>
         <h3>Always up to date</h3>
         <p>New notices appear at the top so you never miss anything.</p>
       </div>
     </div>

     <div className="about-grid">
       <div className="about-card">
         <span className="about-card-icon">🎓</span>
         <h3>Built for students</h3>
         <p>
           Designed with students in mind — clean, fast, and easy to use on
           any device whether you&apos;re on campus or at home.
         </p>
       </div>
       <div className="about-card">
         <span className="about-card-icon">🔒</span>
         <h3>Official & secure</h3>
         <p>
           Only authorized admins can post notices, ensuring every
           announcement you see here is 100% official.
         </p>
       </div>
     </div>

     <div className="about-card-full">
       <h2>Contact</h2>
       <p>
         For technical issues, notice corrections, or to request posting access,
         please contact your institution&apos;s IT helpdesk or the NoticeBoard admin team.
       </p>
     </div>
   </>
 )
}