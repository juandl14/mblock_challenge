const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());

const users = [
    {
        id: 1,
        userName: 'johndoe',
        parentId: -1
    },
    {
        id: 2,
        userName: 'janedoe',
        parentId: 1
    }
];

const posts = [
    {
        postId: 1,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        uploadDate: '1-24-2022',
        ownerId: 1
    },
    {
        postId: 2,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        uploadDate: '1-24-2022',
        ownerId: 2
    }
];


// GET
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/users', (req, res) => {
    res.send(users);
});

app.get('/api/posts', (req, res) => {
    res.send(posts);
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(c => c.id === parseInt(req.params.id));
    if (!user) res.status(404).send('The user was not found');
    res.send(user);
});

app.get('/api/posts/:postId', (req, res) => {
    const post = posts.find(c => c.id === parseInt(req.params.postId));
    if (!post) res.status(404).send('The post was not found');
    res.send(post);
});


// POST
app.post('/api/users', (req, res) => {
    const schema = Joi.object({
        id: Joi.number().integer().positive().required(),
        userName: Joi.string().lowercase().min(3).max(20).required(),
        parentId: Joi.number().integer().min(-1).required()
    });

    const result = schema.validate(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const user = {
        id: users.length + 1,
        userName: req.body.userName,
        parentId: req.body.parentId
    };
    users.push(user);
    res.send(user);
});

app.post('/api/posts', (req, res) => {
    const schema = Joi.object({
        postId: Joi.number().integer().positive().required(),
        description: Joi.string().max(280).required(),
        uploadDate: Joi.date().required(),
        ownerId: Joi.number().integer().positive().required()
    });

    const result = schema.validate(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const post = {
        postId: posts.length + 1,
        description: req.body.description,
        parentId: req.body.parentId
    };

    users.push(user);
    res.send(user);
});



// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));