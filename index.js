const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kwtddbl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const logger = (req, res, next) => {
    console.log('Log: Info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    console.log('token in middleWire',token);

    if(!token){
        return res.status(401).send({message: 'Unauthorize access'})
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({message: 'Unauthorize access'})
        }
        req.user = decoded;
        next();
    })
    
    // next();
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        const assignmentCollection = await client.db("group-study").collection('assignment')
        const takeAssignmentCollection = await client.db("group-study").collection('takeAssignment')
        const myAssignmentCollection = await client.db("group-study").collection('myAssignments')

        app.post('/assignments', async (req, res) => {
            const newAssignment = req.body;
            console.log(newAssignment);
            const result = await assignmentCollection.insertOne(newAssignment);
            res.send(result);
        })

        app.post('/takeAssignments', async (req, res) => {
            const newAssignment = req.body;
            console.log(newAssignment);
            const result = await takeAssignmentCollection.insertOne(newAssignment);
            res.send(result);
        })

        app.post('/myAssignments', async(req, res) => {
            const newAssignment = req.body;
            const result = await myAssignmentCollection.insertOne(newAssignment);
            res.send(result)
        })

        app.post('/jwt', async(req, res) => {
            const user = req.body;
            console.log('user for token',user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            res.cookie('token', token, {
                httpOnly:true,
                secure:true,
                sameSite: 'none'
            })
            .send({success: true});
        })

        app.post('/logout', async(req, res) => {
            const user = req.body;
            console.log('Logout user ', user);
            res.clearCookie('token', {maxAge: 0}).send({success: true});
        })

        app.get('/myAssignments', async(req, res) => {
            const result = await myAssignmentCollection.find().toArray();
            res.send(result)
        })

        app.get('/pendingAssignments', async(req, res) => {
            const result = await takeAssignmentCollection.find().toArray();
            res.send(result);
        })

        app.delete('/deletePendingAssignment/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await takeAssignmentCollection.deleteOne(query);
            res.send(result)
        })

        app.get('/giveMark/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id : new ObjectId(id)};
            const result = await takeAssignmentCollection.findOne(query);
            res.send(result);
        })
        

        app.get('/assignments', async (req, res) => {
            const result = await assignmentCollection.find().toArray();
            res.send(result);
        })

        app.get('/allAssignment', async(req, res) => {
            const result = await assignmentCollection.find().toArray();
            res.send(result);
        })
        app.delete('/deleteAssFromAssPage/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await assignmentCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/takeAssignmentsAll', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await myAssignmentCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/assignmentLevel', logger, verifyToken, async(req, res) => {
            console.log(req.query.difficultyLevel);
            console.log('token owner info',req.user);
            // if(req.user.email !== req.query.email){
            //     return res.status(403).send({message: 'access forbidden'})
            // }
            let query = {};
            if(req.query?.difficultyLevel){
                query =  {difficultyLevel: req.query.difficultyLevel}
            }
            const result = await assignmentCollection.find(query).toArray();
            res.send(result);

        })

        app.get('/updateAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await assignmentCollection.findOne(query);
            res.send(result)
        })
        app.get('/singleAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await assignmentCollection.findOne(query);
            res.send(result)
        })
        app.delete('/deleteAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await myAssignmentCollection.deleteOne(query);
            res.send(result);
        })
        app.put('/updateAssignment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const options = { upsert: true };
            const updateAssignment = req.body;
            const assignment = {
                $set: {
                    assignmentName: updateAssignment.assignmentName,
                    difficultyLevel: updateAssignment.difficultyLevel,
                    assignmentTitle: updateAssignment.assignmentTitle,
                    assignmentMark: updateAssignment.assignmentMark,
                    photo_url: updateAssignment.photo_url,
                    dueTime: updateAssignment.dueTime,
                    description: updateAssignment.description
                }
            }
            const result = await assignmentCollection.updateOne(filter, assignment, options);
            res.send(result);
        })



        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Assignment 11 is running');
})


app.listen(port, (req, res) => {
    console.log(`Assignment 11 is running on ${port}`)
})

