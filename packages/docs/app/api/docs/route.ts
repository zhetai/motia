import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'dist', 'llms.txt');
    const content = await readFile(filePath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain', // Set the correct Content-Type
      },
    });
  } catch (error) {
    console.error('Error reading docs file:', error);
    return new NextResponse('Error reading docs', { status: 500 });
  }
}