import mongoose from 'mongoose';
import { Password } from '../utils/password';

// An interface that describes the properties that are
// required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties a User model will have
interface UserModel extends mongoose.Model<UserDoc> {
  build: (attrs: UserAttrs) => UserDoc;
}

// An interface that describes the properties a User Doc will have
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  }
);

// Pre save hook to hash the password before saving
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashedPassword = await Password.toHash(this.get('password') || '');
    this.set('password', hashedPassword);
  }
  done();
});

// Custom function to built into a model
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
