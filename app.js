const Joi = require('joi');
const express = require('express');
const app = express();
const pool = require("./db/db");

app.use(express.json());

// GET ALL USERS
app.get('/api/users', async(req, res) => {

    try {
        const allUsers = await pool.query("SELECT * FROM users");

        res.json(allUsers.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// GET ALL POSTS
app.get('/api/posts', async(req, res) => {

    try {
        const allPosts = await pool.query("SELECT * FROM posts");

        res.json(allPosts.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// GET A USER BY ID
app.get('/api/users/:userID', async(req, res) => {
    const { userID } = req.params;

    try {
        const user = await pool.query("SELECT * FROM users WHERE userID = $1", [userID]);

        if (!user.rows[0]) {
            res.status(404).send('User not found');
            return;
        }

        res.json(user.rows[0]);
    } catch(err) {
        console.error(err.message);
    }
});

// GET A POST BY ID
app.get('/api/posts/:postID', async(req, res) => {
    const { postID } = req.params;

    try {
        const post = await pool.query("SELECT * FROM posts WHERE postID = $1", [postID]);

        if (!post.rows[0]) {
            res.status(404).send('Post not found');
            return;
        }

        res.json(post.rows[0]);
    } catch(err) {
        console.error(err.message);
    }
});

// ADD A NEW POST
app.post('/api/posts', async(req, res) => {

    try {
        const schema = Joi.object({
            descr: Joi.string().max(280).required(),
            ownerID: Joi.number().integer().positive().required()
        });
    
        const result = schema.validate(req.body);
    
        if (result.error) {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        let current = new Date();
        let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();

        const { descr, ownerID } = req.body;

        const newPost = await pool.query(
            "INSERT INTO posts (descr, uploadDate, likes, ownerID) VALUES ($1, $2, $3, $4) RETURNING *",
            [descr, cDate, 0, ownerID]
        );

        const postChildren = await pool.query(
            "SELECT userID FROM users WHERE parentID = $1",
            [ownerID]
        );

        for (let i = 0; i < postChildren.rows.length; i++) {
            await pool.query(
                "INSERT INTO posts (descr, uploadDate, likes, ownerID) VALUES ($1, $2, $3, $4) RETURNING *",
                [descr, cDate, 0, postChildren.rows[i].userid]
            );
        }

        res.json(newPost.rows[0]);

    } catch (err) {
        console.error(err.message);
    }
});

// ADD A LIKE TO A POST
app.put("/api/posts/:postID", async(req, res) => {

    try {
        const { postID } = req.params;
        const { userID, status } = req.body;
        
        const likes = await pool.query("SELECT likes FROM posts WHERE postID = $1", [postID]);

        if (status === 'liked') {

            // check if user had previously liked the post in question
            const newLike = await pool.query(
                "SELECT * FROM likedBy WHERE userID = $1 AND postID = $2",
                [userID, postID]
            );

            if (newLike.rows[0]) {
                // bad request
                res.status(400).send(`Post with ID ${postID} is already liked by User with ID ${userID}`);
                return;
            }

            // add user and post to the likedBy relation table
            await pool.query(
                "INSERT INTO likedBy VALUES ($1, $2) RETURNING *",
                [userID, postID]    
            );

            // add children and post to the likedBy relation table
            const likeChildren = await pool.query(
                "SELECT userID FROM users WHERE parentID = $1",
                [userID]
            );

            var childrenCount = 1;

            for (let i = 0; i < likeChildren.rows.length; i++) {
                await pool.query(
                    "INSERT INTO likedBy VALUES ($1, $2) RETURNING *",
                    [likeChildren.rows[i].userid, postID]
                );
                childrenCount++;
            }

            // increase like count on post
            await pool.query(
                "UPDATE posts SET likes = $1 WHERE postID = $2",
                [likes.rows[0].likes + childrenCount, postID]
            );

        } else if (status === 'disliked') {

            // check if user had previously liked the post in question
            const newDislike = await pool.query(
                "SELECT * FROM likedBy WHERE userID = $1 AND postID = $2",
                [userID, postID]
            );

            if (!newDislike.rows[0]) {
                // bad request
                res.status(400).send(`Post with ID ${postID} has to have been previously liked by User with ID ${userID} in order to be disliked`);
                return;
            }

            // remove user and post from the likedBy relation table
            await pool.query(
                "DELETE FROM likedBy WHERE userID = $1 AND postID = $2",
                [userID, postID]    
            );

            // decrease like count on post
            await pool.query(
                "UPDATE posts SET likes = $1 WHERE postID = $2",
                [likes.rows[0].likes - 1, postID]
            );
        }
        
        res.json(`Post with ID ${postID} was ${status} by user ${userID}`);

    } catch (err) {
        console.error(err.message);
    }
});


// PORT
const port = process.env.PORT || 3000;

// LISTEN
app.listen(port, () => console.log(`Listening on port ${port}...`));