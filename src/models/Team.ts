import * as mongoose from 'mongoose';
import * as shortid from 'shortid';
import { prop, arrayProp, pre, staticMethod, instanceMethod, Typegoose, ModelType, InstanceType, Ref } from 'typegoose';
import * as bcrypt from 'bcrypt';

import { User, UserModel } from './User';
import { Location } from './Location';

export enum MaterialColor {
  AMBER = 'amber',
  BLUE = 'blue',
  BLUEGREY = 'blueGrey',
  BROWN = 'brown',
  CYAN = 'cyan',
  DEEPORANGE = 'deepOrange',
  DEEPPURPLE = 'deepPurple',
  GREEN = 'green',
  GREY = 'grey',
  INDIGO = 'indigo',
  LIGHTBLUE = 'lightBlue',
  LIGHTGREEN = 'lightGreen',
  LINE = 'lime',
  ORANGE = 'orange',
  PINK = 'pink',
  PURPLE = 'purple',
  RED = 'red',
  TEAL = 'teal',
  YELLOW = 'yellow'
}

class TeamColors extends Typegoose {
  @prop({ enum: MaterialColor })
  primary: MaterialColor;
  @prop({ enum: MaterialColor })
  secondary: MaterialColor
}

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
  @prop()
  name: string;
  @prop({ required: true })
  number: number;
  @prop()
  affiliation?: string;
  @prop()
  location?: Location;  
  @prop()
  city?: string;
  @prop()
  state?: string;
  @prop()
  country?: string;
  @prop()
  photo_url?: string;
  @prop()
  website?: string;  
  @prop()
  year?: number;
  @prop()
  banner_url?: string;  
  @prop()
  colors?: TeamColors;  
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