import { prisma } from '../../../lib/prisma';
import { verifyPassword, signToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { email, password, role } = req.body;

    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (!role || (role !== 'STUDENT' && role !== 'FACULTY')) return res.status(400).json({ error: 'Role is required' });

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Enforce role matching to ensure they log in via the correct flow
    if (user.role !== role) {
      return res.status(400).json({ error: `You are registered as a ${user.role}, not as a ${role}` });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set cookie
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
