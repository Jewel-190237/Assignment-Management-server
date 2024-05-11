const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors({ origin: "*" }));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kwtddbl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

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

        app.get('/myAssignments', async(req, res) => {
            const result = await myAssignmentCollection.find().toArray();
            res.send(result)
        })


        app.get('/takeAssignmentsAll', async(req, res) => {
            const result = await takeAssignmentCollection.find().toArray();
            res.send(result);
        })
        app.get('/pendingAssignments', async(req, res) => {
            const result = await takeAssignmentCollection.find().toArray();
            res.send(result);
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

        app.get('/assignmentsEmail', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await assignmentCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/assignmentLevel', async(req, res) => {
            console.log(req.query.difficultyLevel);
            let query = {};
            if(req.query?.difficultyLevel){
                query =  {difficultyLevel: req.query.difficultyLevel}
            }
            const result = await assignmentCollection.find(query).toArray();
            res.send(result)

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
            const result = await assignmentCollection.deleteOne(query);
            res.send(result)
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
            res.send(result)

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

