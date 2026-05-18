const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, googleProfile, done) => {
        try {
          const email   = googleProfile.emails[0].value;
          const name    = googleProfile.displayName;
          const googleId = googleProfile.id;

          let user = await User.findOne({ where: { googleId } });

          if (user) {
            return done(null, user);
          }

          user = await User.findOne({ where: { email } });

          if (user) {
            await user.update({ googleId });
            return done(null, user);
          }

          const randomPassword = await bcrypt.hash(
            `${googleId}_${Math.random().toString(36)}`,
            10
          );

          user = await User.create({ name, email, password: randomPassword, googleId });
          return done(null, user);

        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

module.exports = configurePassport;