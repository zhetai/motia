import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'dist', 'llm-docs.txt');
    const content = await readFile(filePath, 'utf-8');
    return new NextResponse(content);
  } catch (error) {
    console.error('Error reading docs file:', error);
    return new NextResponse('Error reading docs', { status: 500 });
  }
}