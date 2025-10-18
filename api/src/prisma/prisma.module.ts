import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes the module global
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Allows other modules to use the service
})
export class PrismaModule {}