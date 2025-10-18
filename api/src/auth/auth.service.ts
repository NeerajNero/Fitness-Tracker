import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
        select: { id: true, email:true }
    });
    return user;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
    const { password, ...result } = user; // Exclude password from the result
    return result;
    }
    return null;
  }

  async login(user: any) {
  const payload = { email: user.email, sub: user.id }; // 'sub' is standard for subject (user ID)
  return {
    access_token: this.jwtService.sign(payload),
  };
}

async validateOAuthUser(profile: any): Promise<any> {
  const { email } = profile;

  let user = await this.prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // User doesn't exist, create a new one
    // Note: We're creating a user without a password.
    user = await this.prisma.user.create({
      data: {
        email: email,
        // We're setting a "placeholder" or null password.
        // This is a complex topic. For now, we'll make password nullable.
        // A better approach might be to have a separate 'provider' field.
        password: 'no_password', // Or make password nullable in Prisma
      },
    });
  }

  // We're good, return the user (excluding the password)
  const { password, ...result } = user;
  return result;
}
}

