import { NextResponse } from 'next/server';
import { getCameraDevices } from '@/lib/eufy-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cameras = await getCameraDevices();

    const cameraList = cameras.map((device) => ({
      serialNumber: device.getSerial(),
      name: device.getName(),
      model: device.getModel(),
      stationSerial: device.getStationSerial(),
    }));

    return NextResponse.json({ cameras: cameraList });
  } catch (error) {
    console.error('[/api/cameras] Failed to fetch cameras:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Eufy. Check server credentials.' },
      { status: 500 }
    );
  }
}
