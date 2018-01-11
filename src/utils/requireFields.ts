import { Request, Response, NextFunction } from 'express';
import { badRequest } from './responders';

export function checkFields(fields: string[], data: any): string[] {
  let missing = [];
  let has = [];
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
        if (typeof data[key] === 'object') {
            let subfields = [];
            for (let i = 0; i < fields.length; i++) {
                if (fields[i].includes(key + '.')) {
                    subfields.push(fields[i].substr(fields[i].indexOf(key) + (key as string).length + 1, fields[i].length - 1));
                }
            }
            let checked = checkFields(subfields, data[key]);
            if (checked.length != 0) {
                for (let i = 0; i < checked.length; i++) {
                    missing.push(key + "." + checked[i]);
                }
            }
            has.push(key);
        } else {
            if (fields.indexOf(key) > -1) has.push(key);
        }
    }
  }
  let result = missing.concat(fields.filter(x => {
    if (x.includes('.')) return false;
    else return has.indexOf(x) === -1;
  }));
  return result;
}

export function requireFields(fields: string[], multiName?: string): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    if (multiName) {
      if (req.body[multiName]) {
        console.log(req.body[multiName]);
        console.log(Array.isArray(req.body[multiName]));
        if (Array.isArray(req.body[multiName])) {
          for (let i = 0; i < req.body[multiName].length; i++) {
            let check = checkFields(fields, req.body[multiName][i]);
            if (check.length > 0) {
              return badRequest(req, res, check, { atIndex: i });
            } else {
              return next();
            }
          }
        } else {
          return badRequest(req, res, [], { error: 'The ' + multiName + ' property must be an array' });
        }
      }
    }
    let check = checkFields(fields, req.body);
    if (check.length > 0) {
      badRequest(req, res, check);
    } else {
      next();
    }
  }
}