import * as express from 'express'
import { verify } from 'jsonwebtoken';


export interface Ipayload {
  _id: string,
  name: string,
  email: string,
}

export const verifyToken = (req: any, res: express.Response, next: express.NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request');
  }

  let token = req.headers.authorization.split(' ')[1];

  if (token === 'null') {
    return res.status(401).send('Unauthorized request');
  }
  let payload: Ipayload;
  verify(token, process.env.SECREC_KEY, (err: Error, token: Ipayload) => {
    payload = token;
    if (err) {
      return res.status(401).send('Unauthorized request');
    }
  });

  req.userId = payload._id;

  next();
};
