import * as mongoose from 'mongoose';
import * as shortid from 'shortid';
import { prop, arrayProp, pre, staticMethod, instanceMethod, Typegoose, ModelType, InstanceType, Ref } from 'typegoose';
import * as bcrypt from 'bcrypt';

import { User, UserModel } from './User';
import { Team, TeamModel } from './Team';

export enum SponsorType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY'
}

export class Sponsor extends Typegoose {
  @prop()
  name: string;
  @prop()
  logo_url: string;
  @prop({ enum: SponsorType })
  type: SponsorType;
}

export class Coordinates extends Typegoose {
  @prop()
  lat: number;
  @prop()
  lng: number;
}

export class Location extends Typegoose {
  @prop()
  address: string;
  @prop()
  description: string;
  @prop()
  place_id: string;
  @prop()
  coordinates: Coordinates;
}

export class Ranking extends Typegoose {
  @prop({ ref: Team })
  team: Ref<Team>;
  @prop()
  ranking_points: number;
  @prop()
  qualifying_points: number;
  @prop()
  highest: number;
  @prop()
  rank: number;
  @prop()
  matches: number;
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
  description: string;  
  @prop()
  location: Location;
  @prop()
  start?: Date;
  @prop()
  end?: Date;
  @arrayProp({ items: Sponsor })
  sponsors?: Sponsor[];
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