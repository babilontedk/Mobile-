export const config = {
  port: Number(process.env.PORT || 4101),
  regionCode: process.env.REGION_CODE || 'de',
  regionName: process.env.REGION_NAME || 'Germany',
  regionLabel: process.env.REGION_LABEL || 'eu-central-1',
  regionPublicBaseUrl: process.env.REGION_PUBLIC_BASE_URL || 'http://localhost:4101',
  emulatorImage: process.env.EMULATOR_IMAGE || 'cloud-android-lab-emulator:latest',
  vncPortStart: Number(process.env.EMULATOR_VNC_PORT_START || 6200),
  vncPortEnd: Number(process.env.EMULATOR_VNC_PORT_END || 6249),
  adbPortStart: Number(process.env.EMULATOR_ADB_PORT_START || 5600),
  adbPortEnd: Number(process.env.EMULATOR_ADB_PORT_END || 5649),
  uploadsVolumeName: process.env.UPLOADS_VOLUME_NAME || 'cloud-android-lab_uploads',
};
