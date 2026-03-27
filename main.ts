import express from 'express';
import morgan from 'morgan';
import { config } from './common/config';
import { DockerSessionService } from './session/docker-session.service';

const app = express();
const service = new DockerSessionService();

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, region: config.regionCode, name: config.regionName, label: config.regionLabel });
});

app.get('/device/:port', (req, res) => {
  const port = req.params.port;
  res.redirect(`http://host.docker.internal:${port}`);
});

app.post('/sessions', async (req, res) => {
  try {
    const result = await service.createSession(req.body.sessionId, req.body.countryCode, req.body.countryName);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create session' });
  }
});

app.get('/sessions/:id', async (req, res) => {
  try {
    res.json(await service.getSession(req.params.id));
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Not found' });
  }
});

app.post('/sessions/:id/control', async (req, res) => {
  try {
    res.json(await service.control(req.params.id, req.body.action, req.body.text));
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Control failed' });
  }
});

app.post('/sessions/:id/install-apk', async (req, res) => {
  try {
    res.json(await service.installApk(req.params.id, req.body.filePath));
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Install failed' });
  }
});

app.post('/sessions/:id/screenshot', async (req, res) => {
  try {
    res.json(await service.screenshot(req.params.id));
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Screenshot failed' });
  }
});

app.post('/sessions/:id/reset', async (req, res) => {
  try {
    res.json(await service.reset(req.params.id));
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Reset failed' });
  }
});

app.listen(config.port, () => {
  console.log(`Region agent ${config.regionCode} listening on ${config.port}`);
});
