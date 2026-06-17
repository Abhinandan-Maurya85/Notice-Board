export default function Footer() {
 return (
   <footer className="footer">
     <div className="footer-container">
       <div className="footer-brand">
         <span>📋</span>
         <div>
           <div>NoticeBoard</div>
            
         </div>
       </div>
       <div className="footer-tech">
         <span className="tech-badge">Next.js</span>
         <span className="tech-badge">Prisma</span>
         <span className="tech-badge">PostgreSQL</span>
         <span className="tech-badge">Vercel</span>
       </div>
       <div className="footer-links">
         © 2026 NoticeBoard. All rights reserved.
       </div>
     </div>
   </footer>
 )
}