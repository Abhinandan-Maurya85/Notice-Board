export async function downloadNoticePDF(notice) {
  if (typeof window === 'undefined') return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  // --- Official Border ---
  doc.setDrawColor(203, 213, 225) // Slate-300
  doc.rect(10, 10, 190, 277)

  // --- Official Header ---
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(30, 41, 59) // Slate-800
  doc.text('CAMPUS NOTICE BOARD', 105, 25, { align: 'center' })

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139) // Slate-500
  doc.text('OFFICIAL ANNOUNCEMENT SYSTEM', 105, 31, { align: 'center' })

  // Decorative blue line
  doc.setDrawColor(59, 130, 246) // Blue-500
  doc.setLineWidth(1.5)
  doc.line(20, 37, 190, 37)

  // --- Notice Title ---
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(15, 23, 42) // Slate-900
  
  // Wrap title lines
  const titleLines = doc.splitTextToSize(notice.title.toUpperCase(), 160)
  doc.text(titleLines, 105, 50, { align: 'center' })

  // Compute title height dynamically
  const titleHeight = titleLines.length * 6
  let yPos = 50 + titleHeight + 5

  // --- Metadata Info Box ---
  doc.setFillColor(248, 250, 252) // Slate-50
  doc.setDrawColor(226, 232, 240) // Slate-200
  doc.setLineWidth(0.5)
  doc.rect(20, yPos, 170, 20, 'FD')

  // Labels
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139) // Slate-500
  doc.text('CATEGORY:', 25, yPos + 7)
  doc.text('PRIORITY:', 25, yPos + 14)
  doc.text('DATE:', 110, yPos + 7)
  doc.text('NOTICE ID:', 110, yPos + 14)

  // Values
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(30, 41, 59) // Slate-800
  doc.text(notice.category.toUpperCase(), 48, yPos + 7)

  if (notice.priority === 'Urgent') {
    doc.setTextColor(220, 38, 38) // Red-600
    doc.setFont('Helvetica', 'bold')
  }
  doc.text(notice.priority.toUpperCase(), 46, yPos + 14)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(30, 41, 59)

  const dateStr = new Date(notice.publishDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.text(dateStr, 122, yPos + 7)
  doc.text(`#${notice.id}`, 131, yPos + 14)

  yPos += 30

  // --- Notice Body ---
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(51, 65, 85) // Slate-700

  const bodyLines = doc.splitTextToSize(notice.body, 170)
  const lineHeight = 6.5

  bodyLines.forEach(line => {
    // If yPos exceeds printable area (245 is a safe height with margin for footer/signature)
    if (yPos > 245) {
      doc.addPage()
      // Redraw page border
      doc.setDrawColor(203, 213, 225)
      doc.rect(10, 10, 190, 277)
      yPos = 25
    }
    doc.text(line, 20, yPos)
    yPos += lineHeight
  })

  // --- Signature Block ---
  yPos = Math.max(yPos + 25, 220) // Keep signature line at minimum Y of 220
  
  if (yPos > 250) {
    // Add page if signature doesn't fit
    doc.addPage()
    doc.setDrawColor(203, 213, 225)
    doc.rect(10, 10, 190, 277)
    yPos = 220
  }

  doc.setDrawColor(226, 232, 240) // Slate-200
  doc.setLineWidth(0.5)
  doc.line(120, yPos, 180, yPos)

  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // Slate-600
  doc.text('CAMPUS ADMINISTRATION', 150, yPos + 5, { align: 'center' })

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184) // Slate-400
  doc.text('AUTHORIZED SIGNATURE', 150, yPos + 9, { align: 'center' })

  // --- Verification Footer ---
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184) // Slate-400
  doc.text('This is an officially verified digital campus notice. Generated via NoticeBoard.', 105, 280, { align: 'center' })

  // Save filename formatting
  const sanitizedTitle = notice.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const filename = `Notice-${notice.id}-${sanitizedTitle || 'announcement'}.pdf`
  doc.save(filename)
}
