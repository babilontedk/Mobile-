import { Body, Controller, Get, Param, Post, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  list(@Req() req: any) {
    return this.sessionsService.listForUser(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() body: { countryCode: string }) {
    return this.sessionsService.create(req.user, body.countryCode);
  }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) {
    return this.sessionsService.refresh(req.user.id, id);
  }

  @Post(':id/control')
  control(@Req() req: any, @Param('id') id: string, @Body() body: { action: string; text?: string }) {
    return this.sessionsService.control(req.user.id, id, body.action, body.text);
  }

  @Post(':id/reset')
  reset(@Req() req: any, @Param('id') id: string) {
    return this.sessionsService.reset(req.user.id, id);
  }

  @Post(':id/screenshot')
  screenshot(@Req() req: any, @Param('id') id: string) {
    return this.sessionsService.screenshot(req.user.id, id);
  }

  @Post(':id/install-apk')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/app/uploads',
        filename: (_req, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async installApk(@Req() req: any, @Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new UnauthorizedException('No file uploaded');
    return this.sessionsService.installApk(req.user.id, id, file.path);
  }
}
