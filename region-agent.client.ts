import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RegionAgentClient {
  async createSession(baseUrl: string, payload: any) {
    const { data } = await axios.post(`${baseUrl}/sessions`, payload, { timeout: 120000 });
    return data;
  }

  async getSession(baseUrl: string, regionSessionId: string) {
    const { data } = await axios.get(`${baseUrl}/sessions/${regionSessionId}`);
    return data;
  }

  async control(baseUrl: string, regionSessionId: string, payload: any) {
    const { data } = await axios.post(`${baseUrl}/sessions/${regionSessionId}/control`, payload);
    return data;
  }

  async reset(baseUrl: string, regionSessionId: string) {
    const { data } = await axios.post(`${baseUrl}/sessions/${regionSessionId}/reset`);
    return data;
  }

  async screenshot(baseUrl: string, regionSessionId: string) {
    const { data } = await axios.post(`${baseUrl}/sessions/${regionSessionId}/screenshot`);
    return data;
  }

  async installApk(baseUrl: string, regionSessionId: string, filePath: string) {
    const { data } = await axios.post(`${baseUrl}/sessions/${regionSessionId}/install-apk`, { filePath });
    return data;
  }
}
