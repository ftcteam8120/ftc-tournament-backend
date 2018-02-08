import { prop, arrayProp, pre, staticMethod, instanceMethod, Typegoose, ModelType, InstanceType, Ref } from 'typegoose';

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