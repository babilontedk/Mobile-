import axios from 'axios';
import Docker from 'dockerode';
import { basename } from 'path';
import { config } from '../common/config';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export class DockerSessionService {
  async listManagedContainers() {
    return docker.listContainers({ all: true, filters: { label: ['cloud-android-lab=true', `region=${config.regionCode}`] } as any });
  }

  async findExisting(sessionId: string) {
    const containers = await docker.listContainers({ all: true, filters: { label: [`session-id=${sessionId}`] } as any });
    if (!containers.length) return null;
    return docker.getContainer(containers[0].Id);
  }

  async allocatePort(type: 'vnc' | 'adb') {
    const used = new Set<number>();
    const containers = await this.listManagedContainers();
    for (const container of containers) {
      for (const port of container.Ports || []) used.add(port.PublicPort);
    }
    const start = type === 'vnc' ? config.vncPortStart : config.adbPortStart;
    const end = type === 'vnc' ? config.vncPortEnd : config.adbPortEnd;
    for (let p = start; p <= end; p += 1) if (!used.has(p)) return p;
    throw new Error(`No free ${type} ports left in configured range`);
  }

  async geoInfo() {
    try {
      const ip = (await axios.get('https://api.ipify.org?format=json', { timeout: 8000 })).data.ip;
      const geo = (await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 8000 })).data;
      const timezone = geo.timezone || 'UTC';
      return {
        publicIp: ip,
        timezone,
        localTime: new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone: timezone }).format(new Date()),
      };
    } catch {
      return {
        publicIp: 'unknown',
        timezone: 'UTC',
        localTime: new Date().toISOString(),
      };
    }
  }

  async createSession(sessionId: string, countryCode: string, countryName: string) {
    const existing = await this.findExisting(sessionId);
    if (existing) return this.describeContainer(existing, sessionId, countryCode, countryName);

    const vncPort = await this.allocatePort('vnc');
    const adbPort = await this.allocatePort('adb');
    const volumeName = `cal-session-${sessionId}`;
    try { await docker.createVolume({ Name: volumeName, Labels: { 'cloud-android-lab': 'true', region: config.regionCode } }); } catch {}

    const container = await docker.createContainer({
      Image: config.emulatorImage,
      name: `cal-${config.regionCode}-${sessionId}`,
      Env: [
        'WEB_VNC=true',
        'EMULATOR_DEVICE=Samsung Galaxy S10',
      ],
      ExposedPorts: {
        '6080/tcp': {},
        '5555/tcp': {},
      },
      Labels: {
        'cloud-android-lab': 'true',
        region: config.regionCode,
        'session-id': sessionId,
        'country-code': countryCode,
        'country-name': countryName,
        'vnc-port': String(vncPort),
        'adb-port': String(adbPort),
      },
      HostConfig: {
        PortBindings: {
          '6080/tcp': [{ HostPort: String(vncPort) }],
          '5555/tcp': [{ HostPort: String(adbPort) }],
        },
        Devices: [{ PathOnHost: '/dev/kvm', PathInContainer: '/dev/kvm', CgroupPermissions: 'rwm' }],
        Binds: [
          `${volumeName}:/home/androidusr`,
          `${config.uploadsVolumeName}:/uploads`,
        ],
        RestartPolicy: { Name: 'unless-stopped' },
      },
    });

    await container.start();
    await this.sleep(45000);
    return this.describeContainer(container, sessionId, countryCode, countryName);
  }

  async getSession(sessionId: string) {
    const container = await this.findExisting(sessionId);
    if (!container) throw new Error('Session not found');
    const inspect = await container.inspect();
    return this.describeContainer(container, sessionId, inspect.Config.Labels['country-code'], inspect.Config.Labels['country-name']);
  }

  async describeContainer(container: Docker.Container, sessionId: string, countryCode: string, countryName: string) {
    const inspect = await container.inspect();
    const geo = await this.geoInfo();
    return {
      id: sessionId,
      status: inspect.State.Running ? 'running' : inspect.State.Status,
      countryCode,
      countryName,
      regionCode: config.regionCode,
      regionName: config.regionName,
      regionLabel: config.regionLabel,
      streamUrl: `${new URL(config.regionPublicBaseUrl).protocol}//${new URL(config.regionPublicBaseUrl).hostname}:${inspect.Config.Labels['vnc-port']}`,
      publicIp: geo.publicIp,
      timezone: geo.timezone,
      localTime: geo.localTime,
      androidVersion: 'Android 14',
      deviceModel: 'Samsung Galaxy S10 (virtual)',
      adbPort: Number(inspect.Config.Labels['adb-port']),
      vncPort: Number(inspect.Config.Labels['vnc-port']),
    };
  }

  async control(sessionId: string, action: string, text?: string) {
    const container = await this.findExisting(sessionId);
    if (!container) throw new Error('Session not found');
    const commands: Record<string, string> = {
      home: 'adb shell input keyevent 3',
      back: 'adb shell input keyevent 4',
      recent: 'adb shell input keyevent 187',
      rotate: 'adb shell settings put system accelerometer_rotation 0 && adb shell settings put system user_rotation 1',
      chrome: 'adb shell monkey -p com.android.chrome -c android.intent.category.LAUNCHER 1 || true',
    };
    const command = action === 'text' ? `adb shell input text ${JSON.stringify(text || '')}` : commands[action];
    if (!command) throw new Error('Unsupported action');
    await this.exec(container, command);
    return { ok: true, action };
  }

  async installApk(sessionId: string, filePath: string) {
    const container = await this.findExisting(sessionId);
    if (!container) throw new Error('Session not found');
    const filename = basename(filePath);
    await this.exec(container, `adb install -r /uploads/${filename}`);
    return { ok: true, installed: filename };
  }

  async screenshot(sessionId: string) {
    const container = await this.findExisting(sessionId);
    if (!container) throw new Error('Session not found');
    const output = await this.exec(container, 'adb exec-out screencap -p | base64 -w 0');
    return { ok: true, imageDataUrl: `data:image/png;base64,${output.trim()}` };
  }

  async reset(sessionId: string) {
    const container = await this.findExisting(sessionId);
    if (!container) throw new Error('Session not found');
    const inspect = await container.inspect();
    const vncPort = inspect.Config.Labels['vnc-port'];
    const adbPort = inspect.Config.Labels['adb-port'];
    const countryCode = inspect.Config.Labels['country-code'];
    const countryName = inspect.Config.Labels['country-name'];
    const volumeName = `cal-session-${sessionId}`;

    try { await container.remove({ force: true, v: true }); } catch {}
    try { await docker.getVolume(volumeName).remove({ force: true } as any); } catch {}

    const recreated = await docker.createContainer({
      Image: config.emulatorImage,
      name: `cal-${config.regionCode}-${sessionId}`,
      Env: ['WEB_VNC=true', 'EMULATOR_DEVICE=Samsung Galaxy S10'],
      ExposedPorts: { '6080/tcp': {}, '5555/tcp': {} },
      Labels: {
        'cloud-android-lab': 'true',
        region: config.regionCode,
        'session-id': sessionId,
        'country-code': countryCode,
        'country-name': countryName,
        'vnc-port': String(vncPort),
        'adb-port': String(adbPort),
      },
      HostConfig: {
        PortBindings: {
          '6080/tcp': [{ HostPort: String(vncPort) }],
          '5555/tcp': [{ HostPort: String(adbPort) }],
        },
        Devices: [{ PathOnHost: '/dev/kvm', PathInContainer: '/dev/kvm', CgroupPermissions: 'rwm' }],
        Binds: [
          `${volumeName}:/home/androidusr`,
          `${config.uploadsVolumeName}:/uploads`,
        ],
      },
    });
    await recreated.start();
    await this.sleep(45000);
    return this.describeContainer(recreated, sessionId, countryCode, countryName);
  }

  private async exec(container: Docker.Container, cmd: string) {
    const exec = await container.exec({ Cmd: ['sh', '-lc', cmd], AttachStdout: true, AttachStderr: true, Tty: true });
    const stream = await exec.start({ hijack: true, stdin: false });
    const output = await new Promise<string>((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    });
    return output;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
