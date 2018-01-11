import { InstanceType } from 'typegoose';

export default function actionProcessor(data: InstanceType<any>) {
  const obj = data.toObject();
  obj.id = obj._id;
  return obj;
}