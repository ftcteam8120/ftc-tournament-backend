import * as mongoose from 'mongoose';
import * as shortid from 'shortid';
import { prop, arrayProp, pre, staticMethod, instanceMethod, Typegoose, ModelType, InstanceType, Ref } from 'typegoose';
import * as bcrypt from 'bcrypt';

import { User, UserModel } from './User';

export class Team extends Typegoose {
  @prop({ required: true, unique: true, default: shortid.generate })
  shortid: string;
  @arrayProp({ itemsRef: User })
  coaches?: Ref<User>[];
  @arrayProp({ itemsRef: User })
  members?: Ref<User>[];
  @prop()
  twitter?: string;
  @prop()
  biography?: string;
  @prop({ required: true })
  name: string;
  @prop({ required: true })
  number: number;
  @prop()
  school?: string;
  @prop()
  city?: string;
  @prop()
  state?: string;
  @prop()
  country?: string;
  @prop()
  photo_url?: string;
  @instanceMethod
  getMembers(this: InstanceType<Team>):Promise<InstanceType<User>[]> {
    return new Promise((resolve, reject) => {
      return UserModel.find({ _id: { $in: this.members } }).then((users: InstanceType<User>[]) => {
        resolve(users);
      });
    });
  }
  @instanceMethod
  getCoaches(this: InstanceType<Team>):Promise<InstanceType<User>[]> {
    return new Promise((resolve, reject) => {
      return UserModel.find({ _id: { $in: this.coaches } }).then((users: InstanceType<User>[]) => {
        resolve(users);
      });
    });
  }
  @staticMethod
  static findFor(this: ModelType<Team> & typeof Team, id: string): mongoose.DocumentQuery<InstanceType<Team>, InstanceType<Team>> {
    if (parseInt(id)) {
      return this.findOne({ number: id });
    } else {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return this.findById(id);
      } else {
        return this.findOne({ shortid: id });
      }
    }
  }
}

export const TeamModel = new Team().getModelForClass(Team);
export default TeamModel;