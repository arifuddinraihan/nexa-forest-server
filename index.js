const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// middle ware
app.use(cors());
app.use(express.json())
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tsvgbta.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    // received information from client side
    console.log("Inside Review API with authorization from Client", req.headers.authorization)
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).send({ message: "unauthorized access" })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(401).send({ message: "unauthorized access" })
        }
        req.decoded = decoded;
        next();
    })

}

async function run() {
    try {
        const serviceCollection = client.db('nexaForestDB').collection('services')
        const reviewCollection = client.db('nexaForestDB').collection('reviews')
        const blogCollection = client.db('nexaForestDB').collection('blogs')
        const newsLetterUserCollection = client.db('nexaForestDB').collection('newsLetterUser')
        //    console.log(serviceCollection)

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ "_id": -1 })
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })
        app.post('/services', async (req, res) => {
            const newService = req.body
            console.log(newService)
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })
        app.get('/all-services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ "_id": -1 })
            const allservices = await cursor.toArray()
            res.send(allservices)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log("Inside reviews API with decoded from req headers", decoded)
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: "unauthorized access" })
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query).sort({ "_id": -1 })
            const allReviews = await cursor.toArray()
            res.send(allReviews)
        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { service: id }
            const cursor = reviewCollection.find(query)
            const reviewPerService = await cursor.toArray()
            res.send(reviewPerService)
        })
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const updatedReview = req.body?.updatedReview
            const updatedRating = req.body?.updatedRating
            // console.log(updatedReview, updatedRating)
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    clientReview: updatedReview,
                    rating: updatedRating
                },
            };
            const result = await reviewCollection.updateOne(query, updateDoc)
            res.send(result)
        })
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })
        app.get('/blogs', async (req, res) => {
            const query = {}
            const cursor = blogCollection.find(query)
            const blogs = await cursor.toArray()
            res.send(blogs)
        })
        app.post('/newsletter-users', async (req, res) => {
            const email = req.body;
            const result = await newsLetterUserCollection.insertOne(email)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(err => console.error(err))



app.get('/', (req, res) => {
    res.send("Nexa Forest server is running")
})

app.listen(port, () => {
    console.log(`Nexa Forest Server running on port: ${port}`)
})