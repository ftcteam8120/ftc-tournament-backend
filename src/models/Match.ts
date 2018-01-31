import * as mongoose from 'mongoose';
import * as shortid from 'shortid';
import { prop, arrayProp, pre, staticMethod, instanceMethod, Typegoose, ModelType, InstanceType, Ref } from 'typegoose';
import * as bcrypt from 'bcrypt';

import { Event, EventModel } from './Event';
import { Team, TeamModel } from './Team';

// This is a subdocument of match
class Alliance extends Typegoose {
  @prop()
  total?: number;  
  @prop()
  auto?: number;
  @prop()
  auto_b?: number;  
  @prop()
  tele?: number;
  @prop()
  end?: number;
  @prop()
  penalty?: number;
  @arrayProp({ itemsRef: Team })
  teams: Ref<Team>[];
}

export enum MatchType {
  FINAL = 'FINAL',
  SEMIFINAL = 'SEMIFINAL',
  QUALIFYING = 'QUALIFYING'
}

export enum Winner {
  RED = 'RED',
  BLUE = 'BLUE',
  TIE = 'TIE'
}

export class Match extends Typegoose {
  @prop({ ref: Event, required: true })
  event: Ref<Event>;
  @prop({ enum: MatchType, required: true })
  type: MatchType;
  @prop({ enum: Winner })
  winner: Winner;
  @prop({ required: true })
  number: number;
  // This property is only for semifinals where there are sub matches
  @prop()
  sub?: number;
  @prop()
  red_alliance: Alliance;
  @prop()
  blue_alliance: Alliance;
}

export const MatchModel = new Match().getModelForClass(Match);
export default MatchModel;