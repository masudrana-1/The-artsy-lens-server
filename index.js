const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


//******************************************************** */

// mongodb 


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cjxkvs1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const serviceCollection = client.db('TheArtsyLens').collection('services');
        const reviewCollection = client.db('TheArtsyLens').collection('reviews');

        console.log('db connected')

        // to get service 

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        app.get('/allservices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const allservices = await cursor.toArray();
            res.send(allservices)
        });

        app.get('/allservices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        // to get review 
        app.get('/reviews', async (req, res) => {
            let query = {};

            // filter by email 
            // if (req.query.email) {
            //     query = {
            //         email: req.query.email
            //     }
            // }

            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        // to post service 
        app.post('/allservices', async (req, res) => {
            const order = req.body;
            const result = await serviceCollection.insertOne(order);
            res.send(result);
        });


        // to post review 
        app.post('/reviews', async (req, res) => {
            const order = req.body;
            const result = await reviewCollection.insertOne(order);
            res.send(result);
        });

        // to delete reviews 
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;

            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally {

    }

}
run().catch(error => console.log(error));




//******************************************************* */


app.get('/', (req, res) => {
    res.send('the artsy lens server is running');
})

app.listen(port, () => {
    console.log(`the artsy lens server is running on port: ${port}`);
})