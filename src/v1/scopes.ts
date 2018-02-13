export namespace Scopes {
  export enum Users {
    READ = 'read:users',
    WRITE = 'write:users',
    WRITE_OWN = 'write:users:own',
    DELETE = 'delete:users',
    DELETE_OWN = 'delete:users:own'
  }
  
  export enum Teams {
    READ = 'read:teams',
    WRITE = 'write:teams',
    WRITE_OWN = 'write:teams:own',
    DELETE = 'delete:teams',
    DELETE_OWN = 'delete:teams:own'
  }

  export enum Events {
    READ = 'read:events',
    WRITE = 'write:events',
    WRITE_OWN = 'write:events:own',
    DELETE = 'delete:events',
    DELETE_OWN = 'delete:events:own'
  }

  export enum Matches {
    READ = 'read:matches',
    WRITE = 'write:matches',
    DELETE = 'delete:matches',
  }
}

export const defaultScopes = [Scopes.Teams.READ, Scopes.Events.READ, Scopes.Matches.READ, Scopes.Users.READ].join(' ');