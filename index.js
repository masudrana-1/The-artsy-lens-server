const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

// jwt token varify
function verifyJWt(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader)

    if (!authHeader) {
        return res.send(401)({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        // console.log(token);
        if (error) {
            // console.log(error)
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;

        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('TheArtsyLens').collection('services');
        const reviewCollection = client.db('TheArtsyLens').collection('reviews');

        console.log('db connected')

        // jwt token 

        app.post('/jwt', async (req, res) => {
            const user = req.body;
            // console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
            res.send({ token });
        })


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
        app.get('/reviews', verifyJWt, async (req, res) => {

            const decoded = req.decoded;
            // console.log('inside reviews api', decoded);

            // console.log(decoded.email, req.query.email);
            if (decoded.email !== req.query.email) {

                return res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};

            // filter by email 
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

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

        // update review 
        // app.put('/reviews/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const review = await reviewCollection.find(filter);
        //     const option = { upsert: true };
        //     const updatedReview = {
        //         $set: {
        //             serviceId: review.serviceId,
        //             serviceName: review.serviceName,
        //             serviceImg: review.img,
        //             name: review.name,
        //             email: review.email,
        //             comment: review.comment
        //         }
        //     }
        //     const result = await reviewCollection.updateOne(filter, updatedReview, option);
        //     res.send(result);
        //     // console.log(updatedUser);
        // })

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