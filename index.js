const express = require('express');
const cors = require('cors');
const jwt =  require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.if9xwsm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message: 'Unauthorized Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
      if(err){
        return res.status(403).send({message: 'Forbidden Access'})
      }
      req.decoded = decoded;
      next();
    })
  }
  

async function run() {
    try {
        const serviceCollection = client.db('getvisadata').collection('services');
        const reviewCollection = client.db('getvisadata').collection('reviews');

        // app.post('/jwt', (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
        //     res.send({token})
        //   })

        app.get('/services', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
          });

        app.get('/servicesHome', async(req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.post('/newService', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
          });


        app.get('/reviews', async(req, res) => {
            // const decoded = req.decoded;
            // console.log(decoded);
            // if(decoded.email !== req.query.email){
            //   res.status(403).send({message: 'Unauthorized Access'})
            // }
            let query = {};
            if(req.query.serviceId) {
              query = {
                serviceId: req.query.serviceId
              }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
          });

          app.get('/reviews/:serviceId', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
          })
    
          app.post('/myreviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
          });
    
          app.patch('/reviews/:serviceId', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = {_id: ObjectId(id)};
            const updateDoc = {
              $set:{
                status: status
              }
            }
            const result = await reviewCollection.updateOne(query, updateDoc);
            res.send(result);
          })
    
          app.delete('/reviews/:serviceId', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
          })
    }
    finally {

    }
}

run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('get visa server is running');
});

app.listen(port, () => {
    console.log(`get visa is running on the port: ${port}`)
})