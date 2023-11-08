import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@khushdeeptickets/common';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .trim()
      .isLength({
        max: 20,
        min: 4,
      })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if we already have a user with the email provided
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError(
        'Email already in use. Please provide a different email to sign up'
      );
    }

    const user = User.build({ email, password });

    await user.save();

    // Generate a json web token
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    /**
     * req.session is going to be an object that is created by the cookie session middleware. Any information we store on this
     * object will be automatically serialized by cookie session and stored inside the cookie. So once we generate that JSON web token
     * we're going to set it on record session, and that's pretty.
     */
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
