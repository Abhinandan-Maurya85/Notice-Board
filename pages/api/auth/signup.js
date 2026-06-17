import { prisma } from '../../../lib/prisma';
import { hashPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!role || (role !== 'STUDENT' && role !== 'FACULTY')) return res.status(400).json({ error: 'Role must be STUDENT or FACULTY' });

    const emailClean = email.trim().toLowerCase();
    
    // Check if user exists
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
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set HTTP-only cookie valid for 1 day
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
