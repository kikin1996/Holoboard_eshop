import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

interface RegisterRequestBody {
  email: string;
  password: string;
  name?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RegisterRequestBody>;

  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Zadejte platný e-mail.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Heslo musí mít alespoň 8 znaků.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Účet s tímto e-mailem už existuje.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { email, passwordHash, name: name || null },
  });

  return NextResponse.json({ ok: true });
}
