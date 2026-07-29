import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Nepřihlášen.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      phone: true,
      street: true,
      city: true,
      zipCode: true,
      savedPacketaBranchId: true,
      savedPacketaBranchName: true,
    },
  });

  return NextResponse.json({
    phone: user?.phone ?? '',
    street: user?.street ?? '',
    city: user?.city ?? '',
    zipCode: user?.zipCode ?? '',
    savedPacketaBranchId: user?.savedPacketaBranchId ?? null,
    savedPacketaBranchName: user?.savedPacketaBranchName ?? null,
  });
}

interface ProfilePatchBody {
  phone?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  packetaBranchId?: string | null;
  packetaBranchName?: string | null;
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Nepřihlášen.' }, { status: 401 });
  }

  const body = (await request.json()) as ProfilePatchBody;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.phone !== undefined && { phone: body.phone.trim() || null }),
      ...(body.street !== undefined && { street: body.street.trim() || null }),
      ...(body.city !== undefined && { city: body.city.trim() || null }),
      ...(body.zipCode !== undefined && { zipCode: body.zipCode.trim() || null }),
      ...(body.packetaBranchId !== undefined && {
        savedPacketaBranchId: body.packetaBranchId,
        savedPacketaBranchName: body.packetaBranchName ?? null,
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
