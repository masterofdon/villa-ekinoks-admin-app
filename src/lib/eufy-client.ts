/**
 * Singleton EufySecurity client for server-side use only.
 * This module must only be imported in API routes / server components.
 */
import { EufySecurity, EufySecurityConfig, Device } from 'eufy-security-client';

// Use globalThis to survive HMR reloads in dev mode
declare global {
  // eslint-disable-next-line no-var
  var __eufyClient: EufySecurity | undefined;
  // eslint-disable-next-line no-var
  var __eufyClientInitializing: Promise<EufySecurity> | undefined;
}

const config: EufySecurityConfig = {
  username: process.env.EUFY_USERNAME ?? '',
  password: process.env.EUFY_PASSWORD ?? '',
  country: process.env.EUFY_COUNTRY ?? 'US',
  trustedDeviceName: 'villa-admin-app',
  persistentDir: process.env.EUFY_PERSISTENT_DIR ?? '/tmp/eufy-persistent',
  p2pConnectionSetup: 2, // P2PConnectionType.PREFER_LOCAL = 1, ONLY_REMOTE = 2
  pollingIntervalMinutes: 10,
  eventDurationSeconds: 10,
};

export async function getEufyClient(): Promise<EufySecurity> {
  if (globalThis.__eufyClient) {
    return globalThis.__eufyClient;
  }

  if (globalThis.__eufyClientInitializing != null) {
    return globalThis.__eufyClientInitializing;
  }

  globalThis.__eufyClientInitializing = (async () => {
    const client = await EufySecurity.initialize(config);
    await client.connect();

    // Wait until both stations and devices are loaded
    await new Promise<void>((resolve) => {
      let stationsLoaded = false;
      let devicesLoaded = false;

      const checkDone = () => {
        if (stationsLoaded && devicesLoaded) resolve();
      };

      client.on('stations loaded', () => {
        stationsLoaded = true;
        checkDone();
      });
      client.on('devices loaded', () => {
        devicesLoaded = true;
        checkDone();
      });

      // Resolve after timeout in case events were already fired
      setTimeout(resolve, 8000);
    });

    globalThis.__eufyClient = client;
    globalThis.__eufyClientInitializing = undefined;
    return client;
  })();

  return globalThis.__eufyClientInitializing;
}

export async function getCameraDevices(): Promise<Device[]> {
  const client = await getEufyClient();
  const devices = await client.getDevices();
  return devices.filter((d) => Device.isCamera(d.getDeviceType()));
}
