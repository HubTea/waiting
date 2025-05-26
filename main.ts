import 'dotenv/config';
import {Sequelize} from 'sequelize';
import express from 'express';

let sequelize = new Sequelize(process.env.DB_URL as string);
sequelize.authenticate().then(() => console.log('sequelize authenticated'));

let app = express();
app.listen(parseInt(process.env.LISTEN_PORT as string), () => console.log('listening ' + process.env.LISTEN_PORT));
