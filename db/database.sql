CREATE TABLE users (
    userID SERIAL PRIMARY KEY,
    userName VARCHAR(15) UNIQUE NOT NULL,
    parentID INT
);

INSERT INTO users(userName, parentID) VALUES ('johndoe', NULL);

INSERT INTO users(userName, parentID) VALUES ('janedoe', 1);

INSERT INTO users(userName, parentID) VALUES ('johndoejr', 1);

CREATE TABLE posts (
    postID SERIAL PRIMARY KEY,
    descr VARCHAR(280),
    uploadDate DATE NOT NULL,
    likes INT NOT NULL,
    ownerID INT NOT NULL REFERENCES Users
);

CREATE TABLE likedBy (
    userID INT NOT NULL REFERENCES Users,
    postID INT NOT NULL REFERENCES Posts,
    PRIMARY KEY(userID, postID)
);