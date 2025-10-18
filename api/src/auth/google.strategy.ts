// api/src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,       // From your .env file
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // From your .env file
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'], // What info we want from Google
    });
  }

  // This function runs after Google authenticates the user
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken, // We can store this if we need to interact with Google APIs later
    };
    // The 'done' callback passes the user object to be attached to req.user
    done(null, user);
  }
}