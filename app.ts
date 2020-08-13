import * as express from 'express';
const app: express.Application = express();
const PORT = process.env.PORT || 3000;

import * as mongoose from 'mongoose';
import * as cors from 'cors';

// import and envoke env config file
import { config } from 'dotenv';
config();

app.use(express.json());
app.use(cors());

/* app APIs */
import userAPIs from './routes/user.route';

app.use('/user', userAPIs);
/* / app APIs */

// connect to db
mongoose.connect(
  'mongodb://localhost:27017/hussein',
  { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true })
  .then(conn => console.log('connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`app running on port ${PORT}`));
