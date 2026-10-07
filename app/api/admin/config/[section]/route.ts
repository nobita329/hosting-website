import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { COOKIE_NAME, verifySessionToken } from '@/lib/admin-auth';

const ALLOWED_SECTIONS = [
  'dedicated',
  'discord',
  'games',
  'hero',
  'language',
  'legal',
  'navigation',
  'pricing',
  'showcase',
  'ui',
  'vps',
  'webhosting',
];

function checkAuth(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = verifySessionToken(token);
  return !!session;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await params;

  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json(
      { error: `Invalid section: ${section}` },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(
      process.cwd(),
      'app',
      'config',
      'sections',
      `${section}.json`
    );
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to load config: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await params;

  if (!ALLOWED_SECTIONS.includes(section)) {
    return NextResponse.json(
      { error: `Invalid section: ${section}` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration payload' },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      'app',
      'config',
      'sections',
      `${section}.json`
    );

    // Write formatted JSON with trailing newline
    const formattedJson = JSON.stringify(body, null, 2) + '\n';
    await fs.writeFile(filePath, formattedJson, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `${section}.json updated successfully`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to save config: ${err.message}` },
      { status: 500 }
    );
  }
}

