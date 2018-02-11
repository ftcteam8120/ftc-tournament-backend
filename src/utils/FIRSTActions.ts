import { Agent } from 'https';
import fetch from 'node-fetch';
import { InstanceType } from 'typegoose';
import { Team } from '../models/Team';
import actionProcessor from './actionProcessor';
import * as shortid from 'shortid';

const agent = new Agent({
  rejectUnauthorized: false
});

const BASE_TEAMS_URL = 'https://es01.usfirst.org/teams/';

namespace FIRST {
  export interface Award {
    award: string;
    event_name: string;
    event_season: string;
    eventcode_cache: string;
    fk_events: number;
    fk_team_profiles: number;
    id: number;
  }

  export interface Event {
    event_name: string;
    event_season: string;
    fk_events: number;
    fk_team_profiles: number;
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
}

async function queryTeam(query: any, size: number = 20, from: number = 0): Promise<FIRST.Team[]> {
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

export async function findTeam(number: number): Promise<FIRST.Team> {
  return queryTeam({
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
  }, 1).then((results) => {
    return results[0];
  });
}

export async function interpolateFirstTeamData(number: number, sourceData: InstanceType<Team>): Promise<Normalized.Team> {
  let source: any = {};
  if (sourceData) source = actionProcessor(sourceData);
  return findTeam(number).then((firstData: FIRST.Team) => {
    if (firstData) {
      return {
        id: source._id || 'tmp-' + shortid.generate(),
        number,
        country: firstData.team_country,
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