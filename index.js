import express from 'express'; 
import bodyParser from 'body-parser';
import router from './routes/api.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server run on port: ${port}`);
})