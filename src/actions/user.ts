import { InstanceType } from 'typegoose';
import { UserModel, User } from '../models/User';
import actionProcessor from '../utils/actionProcessor';

export async function findUserById(id: string) {
  return UserModel.findById(id).then((user: InstanceType<User>) => {
    return actionProcessor(user);
  });
}

export async function findUsers(users?: any[]) {
  let query;
  if (users) {
    query = { _id: users };
  }
  return UserModel.find(query).then((users: InstanceType<User>[]) => {
    const usersObjs = [];
    for (let i = 0; i < users.length; i++) {
      usersObjs.push(actionProcessor(users[i]));
    }
    return usersObjs;
  });
}