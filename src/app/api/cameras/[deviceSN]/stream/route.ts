import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { getEufyClient } from '@/lib/eufy-client';
import type { Station, Device } from 'eufy-security-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deviceSN: string }> }
) {
  const { deviceSN } = await params;

  try {
    const client = await getEufyClient();

    // Start the P2P livestream for this device
    await client.startStationLivestream(deviceSN);

    // Wait for the livestream to begin and capture the video Readable
    const videoStream: Readable = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Livestream start timed out after 15s'));
      }, 15_000);

      const onStart = (
        _station: Station,
        device: Device,
        _metadata: unknown,
        videostream: Readable,
        _audiostream: Readable
      ) => {
        if (device.getSerial() === deviceSN) {
          clearTimeout(timeout);
          client.off('station livestream start', onStart);
          resolve(videostream);
        }
      };

      client.on('station livestream start', onStart);
    });

    // Convert Node.js Readable to Web ReadableStream so Next.js can stream it
    const webReadable = Readable.toWeb(videoStream) as ReadableStream<Uint8Array>;

    // Stop the eufy stream when the client disconnects
    const abortController = new AbortController();
    _request.signal.addEventListener('abort', () => {
      abortController.abort();
      client.stopStationLivestream(deviceSN).catch(() => {});
    });

    return new Response(webReadable, {
      status: 200,
      headers: {
        'Content-Type': 'video/H264',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error(`[/api/cameras/${deviceSN}/stream] Error:`, error);
    return new Response(
      JSON.stringify({ error: 'Failed to start camera stream' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
