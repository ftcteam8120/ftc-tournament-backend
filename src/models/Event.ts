import * as mongoose from 'mongoose';
import * as shortid from 'shortid';
import { prop, arrayProp, pre, staticMethod, instanceMethod, Typegoose, ModelType, InstanceType, Ref } from 'typegoose';
import * as bcrypt from 'bcrypt';

import { User, UserModel } from './User';
import { Team, TeamModel } from './Team';

export class Ranking extends Typegoose {
  @prop({ ref: Team })
  team: Ref<Team>;
  @prop()
  score: number;
  @prop()
  ranking: number;
}

export class Event extends Typegoose {
  @prop({ required: true, unique: true, default: shortid.generate })
  shortid: string;
  @arrayProp({ itemsRef: User, required: true })
  admins: Ref<User>[];
  @arrayProp({ itemsRef: Team })
  teams?: Ref<Team>[];
  @prop()
  current_round?: number;
  @prop({ required: true })
  name: string;
  @prop()
  location: string;
  @prop()
  start?: Date;
  @prop()
  end?: Date;
  @prop()
  logo_url?: string;
  @prop()
  primary_color: string;
  @prop()
  secondary_color: string;
  @arrayProp({ items: Ranking })
  rankings: Ranking[];  
  @staticMethod
  static findFor(this: ModelType<Event> & typeof Event, id: string): mongoose.DocumentQuery<InstanceType<Event>, InstanceType<Event>> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return this.findById(id);
    } else {
      return this.findOne({ shortid: id });
    }
  }
}

export const EventModel = new Event().getModelForClass(Event);
export default EventModel;