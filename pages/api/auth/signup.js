import { prisma } from '../../../lib/prisma';
import { hashPassword, signToken } from '../../../lib/auth';
import { COURSES } from '../../../lib/courses';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { name, email, password, role, course } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!role || (role !== 'STUDENT' && role !== 'FACULTY')) return res.status(400).json({ error: 'Role must be STUDENT or FACULTY' });

    // Course is required for STUDENT, ignored for FACULTY
    let finalCourse = null;
    if (role === 'STUDENT') {
      if (!course || !COURSES.includes(course)) {
        return res.status(400).json({ error: 'Please select a valid course' });
      }
      finalCourse = course;
    }

    const emailClean = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: emailClean } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailClean,
        password: hashedPassword,
        role: role,
        course: finalCourse,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      course: user.course,
    });

    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, course: user.course }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}