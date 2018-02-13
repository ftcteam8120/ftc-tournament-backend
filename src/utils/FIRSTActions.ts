import { Agent } from 'https';
import fetch from 'node-fetch';
import * as mongoose from 'mongoose';
import { InstanceType } from 'typegoose';
import { Team } from '../models/Team';
import { Event } from '../models/Event';
import actionProcessor from './actionProcessor';
import * as shortid from 'shortid';
import * as _ from 'lodash';
import { TeamId, DecodeTeamId } from './ids';

const agent = new Agent({
  rejectUnauthorized: false
});

const BASE_TEAMS_URL = 'https://es01.usfirst.org/teams/';
const BASE_EVENTS_URL = 'https://es01.usfirst.org/events/';

namespace FIRST {
  export interface Award {
    award: string;
    event_name: string;
    event_season: number;
    eventcode_cache: string;
    fk_events: number;
    fk_team_profiles: number;
    id: number;
  }

  export interface Event {
    event_season: number;
    fk_events: number;
    fk_team_profiles: number;
    event_name: string;
    event_code: string;
    event_subtype: string;
    event_subtype_moniker: string;
    event_venue: string;
    event_stateprov: string;
    event_country: string;
    event_city: string;
    event_address1: string;
    event_address2: string;
    date_end: string;
    date_start: string;
    event_postalcode: string;
    flag_bag_and_tag_event: boolean;
    location: Location;
    countryCode: string;
    event_fee_currency: string;
    id: number;
  }

  export interface Location {
    lat: number;
    lon: number;
  }

  export interface Team {
    awards: Award[];
    countryCode: string;
    events: Event[];
    fk_program_seasons: number;
    id: number;
    location: Location;
    profile_year: number;
    program_code_display: string;
    program_name: string;
    team_city: string;
    team_country: string;
    team_name_calc: string;
    team_nickname: string;
    team_number_yearly: number;
    team_postalcode: string;
    team_rookieyear: number;
    team_stateprov: string;
    team_type: string;
    team_web_url: string;
  }
}

namespace Normalized {
  export interface Node {
    id: string;
    shortid?: string;
  }
  export interface Photo {
    value: string;
  }
  
  export interface Email {
    value: string;
    type?: string;
  }
  
  export interface Name {
    givenName?: string;
    familyName?: string;
    middleName?: string;
  }
  
  export interface Profile {
    provider?: string;
    id?: string;
    displayName?: string;
    name?: Name;
    emails?: Email[];
    photos?: Photo[];
  }
  
  export interface User extends Node {
    teams?: Team[];
    username?: string;
    profile?: Profile;
  }
  export interface Team extends Node {
    coaches?: User[];
    members?: User[];
    twitter?: string;
    biography?: string;
    name?: string;
    number?: number;
    affiliation?: string;
    location?: Location;
    city?: string;
    state?: string;
    country?: string;
    website?: string;
    photo_url?: string;
    year?: number;
  }
  export enum EventType {
    SCRIMMAGE = 'SCRIMMAGE',
    MEET = 'MEET',
    QUALIFYING = 'QUALIFYING',
    SUPER_QUALIFYING = 'SUPER_QUALIFYING',
    CHAMPIONSHIP = 'CHAMPIONSHIP',
    SUPER_REGIONAL = 'SUPER_REGIONAL',
    WORLD  = 'WORLD'
  }
  
  export enum SponsorType {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY'
  }
  export interface Sponsor {
    name?: string;
    logo_url?: string;
    type?: SponsorType;
  }
  export interface Ranking {
    team?: Team;
    ranking_points?: number;
    qualifying_points?: number;
    highest?: number;
    rank?: number;
  }
  export interface Coordinates {
    lat?: number;
    lng?: number;
  }
  export interface Location {
    address?: string;
    description?: string;
    place_id?: string;
    coordinates?: Coordinates;
  }
  export interface Event extends Node {
    type?: EventType;
    code?: string;
    current_round?: number;
    name?: string;
    location?: Location;
    description?: string;
    start?: Date;
    end?: Date;
    sponsors?: Sponsor[];
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    rankings?: Ranking[];
  }
}

async function queryTeams(query: any, size: number = 20, from: number = 0): Promise<FIRST.Team[]> {
  let url_encoded = encodeURIComponent(JSON.stringify({ query }));
  return fetch(`${BASE_TEAMS_URL}_search?size=${size}&from=${from}&source=${url_encoded}`, { agent }).then((res) => {
    return res.json();
  }).then((json) => {
    let results = [];
    json.hits.hits.forEach(hit => {
      results.push(hit._source);
    });
    return results;
  });
}

async function queryEvents(query: any, size: number = 20, from: number = 0): Promise<FIRST.Event[]> {
  let url_encoded = encodeURIComponent(JSON.stringify({ query }));
  return fetch(`${BASE_EVENTS_URL}_search?size=${size}&from=${from}&source=${url_encoded}`, { agent }).then((res) => {
    return res.json();
  }).then((json) => {
    let results = [];
    json.hits.hits.forEach(hit => {
      results.push(hit._source);
    });
    return results;
  });
}


export async function findTeam(number: number): Promise<FIRST.Team> {
  return queryTeams({
    filtered: {
      query: {
        bool: {
          must: [
            {
              match: {
                team_number_yearly: number
              }
            }, {
              bool: {
                must: [
                  [
                    {
                      match: {
                        team_type: "FTC"
                      }
                    }
                  ]
                ]
              }
            }
          ]
        }
      }
    }
  }, 20).then((results) => {
    // Sort the teams and make sure to return the latest profile year
    return _.orderBy(results, 'profile_year', 'desc')[0];
  });
}

export async function findTeamById(id: string): Promise<FIRST.Team> {
  let { number } = DecodeTeamId(id);
  return findTeam(number);
}

export async function findEvent(code: string): Promise<FIRST.Event> {
  return queryEvents({
    filtered: {
      query: {
        bool: {
          must: [
            {
              match: {
                event_code: code
              }
            }
          ]
        }
      }
    }
  }, 1).then((results) => {
    return results[0];
  });
}

export async function interpolateFirstTeamData(ident: number | string, sourceData: InstanceType<Team>): Promise<Normalized.Team> {
  let source: any = {};
  let number;
  if ((typeof ident) === 'string') {
    number = DecodeTeamId(ident as string).number;
  } else {
    number = ident;
  }
  if (sourceData) source = actionProcessor(sourceData);
  return findTeam(number).then((firstData: FIRST.Team) => {
    if (firstData) {
      return {
        id: TeamId(number),
        number,
        country: firstData.countryCode,
        state: firstData.team_stateprov,
        city: firstData.team_city,
        affiliation: firstData.team_name_calc,
        name: firstData.team_nickname,
        website: firstData.team_web_url,
        location: {
          coordinates: {
            lat: firstData.location[0].lat,
            lng: firstData.location[0].lon
          }
        },
        ...source
      };
    } else {
      throw new Error('Team not found');
    }
  });
}

export async function interpolateFirstEventData(code: string, sourceData: InstanceType<Event>): Promise<Normalized.Event> {
  let source: any = {};
  if (sourceData) source = actionProcessor(sourceData);
  return findEvent(code).then((firstData: FIRST.Event) => {
    let location: any = {};
    location.address = firstData.event_address1 + ' ' + firstData.event_city + ' ' + firstData.event_stateprov + ' ' + firstData.event_postalcode;
    location.coordinates = firstData.location;
    if (source.location) {
      if (source.location.address) location.address = source.location.address;
      if (source.location.coordinates) location.coordinates = source.location.coordinates;
      delete source.location;
    }
    if (firstData) {
      return {
        id: source._id || new mongoose.mongo.ObjectId(),
        code: firstData.event_code,
        season: firstData.event_season,
        identifier: firstData.event_city.toUpperCase(),
        name: firstData.event_name,
        location,
        start: firstData.date_start,
        end: firstData.date_end,
        ...source
      };
    } else {
      throw new Error('Event not found');
    }
  });
}