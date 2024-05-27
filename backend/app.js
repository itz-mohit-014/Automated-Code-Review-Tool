import express from 'express';
import dotenv from 'dotenv';
import databaseConnection from './src/db/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('../frontend'))

// Database connection

databaseConnection().then(() => {
    app.on('error' , () =>{
        console.log('database connection failed')
    })
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
}).catch((err) => {
  console.error('Database connection error', err);
});


//*******    Important routes  ******* //


// main server routes to test server...
// app.get('/', (req, res) => {
//   res.send('Automated Code Review Tool API');
// });

// Routes
import router from './src/routers/router.js';
app.use('/api/v1', router);



