import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { Get } from '@nestjs/common';
import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(AuthGuard('local')) // This triggers our LocalStrategy
@Post('login')
async login(@Request() req, @Res({ passthrough: true }) res: Response, @Body() loginDto: LoginDto /* DTO for login */) {

  const { access_token } = await this.authService.login(req.user);
  // If the LocalStrategy succeeds, it attaches the user object to the request.
  // We then pass this user object to our login service to get the JWT.

  res.cookie('access_token', access_token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: false, // Should be true in production (HTTPS)
      sameSite: 'lax', // Or 'strict'
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
    });

  return this.authService.login(req.user);
}

 @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

@UseGuards(AuthGuard('jwt')) // This is the JWT bouncer!
@Get('profile')
getProfile(@Request() req) {
  // The JwtStrategy has already validated the token and attached the user payload.
  return req.user;
}

@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth(@Request() req) {
  // This route just triggers the Google strategy and redirects
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res: Response) {
  // The GoogleStrategy.validate() method has run, and req.user is populated.
  // Now, we find or create our user.
  const user = await this.authService.validateOAuthUser(req.user);

  // Generate our own JWT and set the cookie
  const { access_token } = await this.authService.login(user);
  
  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: false, // Should be true in production
    sameSite: 'lax',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
  });

  // Redirect the user back to the frontend dashboard
  res.redirect('http://localhost:3001/dashboard');
}
}