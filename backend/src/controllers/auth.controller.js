import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        studentProfile: true,
        teacherProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. No user found with this email.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'edusphere_super_secure_jwt_token_secret_key_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const fullName = user.studentProfile?.fullName || user.teacherProfile?.fullName || 'Administrator';
    const studentId = user.studentProfile?.studentId || null;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName,
        role: user.role,
        studentId,
        avatar: fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during authentication.', error: err.message });
  }
}

export async function register(req, res) {
  try {
    const { email, password, fullName, phone, currentClass, board } = req.body;

    if (!email || !password || !fullName || !phone || !currentClass) {
      return res.status(400).json({ message: 'All registration fields are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const studentNumber = 'STU-' + Math.floor(1000 + Math.random() * 9000);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            studentId: studentNumber,
            fullName,
            phone,
            currentClass,
            board: board || 'CBSE'
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const secret = process.env.JWT_SECRET || 'edusphere_super_secure_jwt_token_secret_key_2026';
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Student account created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName,
        studentId: studentNumber,
        role: 'STUDENT',
        avatar: fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        teacherProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fullName = user.studentProfile?.fullName || user.teacherProfile?.fullName || 'Administrator';

    res.json({
      id: user.id,
      email: user.email,
      fullName,
      role: user.role,
      studentId: user.studentProfile?.studentId || null,
      avatar: fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving profile', error: err.message });
  }
}
