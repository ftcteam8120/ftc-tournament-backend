import * as Hashids from 'hashids';
const hashids = new Hashids(process.env.HASHIDS_SALT);

export function TeamId(number: number): string {
  return hashids.encode(number);
}

export function DecodeTeamId(id: string): { number: number } {
  let arr = hashids.decode(id);
  return {
    number: arr[0]
  };
}