const fs = require("fs");
const { validateUser } = require("../userHelpers");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// POST /users with uuid, unique username >>done
// PATCH /users/id >>done
// GET /users with age filter  >>done
// POST /users/login /sucess 200 , error:403 >>done
// GET /users/id   200,   eror:404
// DELETE users/id  200,    error:404


router.post("/", validateUser, async (req, res, next) => {
    try {
        const { username, age, password } = req.body;
        const data = await fs.promises
            .readFile("./user.json", { encoding: "utf8" })
            .then((data) => JSON.parse(data));
        const id = uuidv4();
        data.push({ id, username, age, password });
        await fs.promises.writeFile("./user.json", JSON.stringify(data), {
            encoding: "utf8",
        });
        res.send({ id, message: "sucess" });
    } catch (error) {
        next({ status: 500, internalMessage: error.message });
    }
});


router.patch("/:userId", validateUser, async (req, res, next) => {
    try {
        const { username, age, password } = req.body;
        const users = await fs.promises.readFile("./user.json", { encoding: "utf8" })
            .then((data) => JSON.parse(data));

        const newuser = users.map((user) => {
            if (user.id !== req.params.userId) return user;
            return { id: req.params.userId, username, password, age };
        });

        await fs.promises.writeFile("./user.json", JSON.stringify(newuser), {
            encoding: "utf8",
        });
        res.status(200).send({ message: "done" });
    } catch (error) {
        next({ status: 500, internalMessage: error.message });
    }
});


router.get("/", validateUser, async (req, res, next) => {
    try {
        const age = Number(req.query.age)
        const users = await fs.promises
            .readFile("./user.json", { encoding: "utf8" })
            .then((data) => JSON.parse(data));
        const filteredUsers = users.filter(user => user.age === age)
        res.send(filteredUsers)
    } catch (error) {
        next({ status: 500, internalMessage: error.message });
    }

});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const users = await fs.promises
            .readFile("./user.json", { encoding: "utf8" })
            .then((data) => JSON.parse(data));

        const reqUser = users.find((user) => user.username === username && user.password === password);

        if (username) {
            return next({ status: 200, message: "success" })
        } else {
            return next({ status: 403, message: "try again" })
        }
    } catch {
        next({ status: 500, internalMessage: error.message });
    }

});


router.get('/:uersId', async (req, res, next) => {
    try {
        const id = req.params.userId;

        const users = await fs.promises
            .readFile("./user.json", { encoding: "utf8" })
            .then((data) => JSON.parse(data));

        const getUser = users.filter((user) => user.id === id);

        res.status(200).send(getUser)

    } catch (error) {
        next({ status: 404, internalMessage: error.message });
    }

});


router.delete('/:uesrId', async (req, res, next) => {
    try {
        const id = req.params.userId;

        const users = await fs.promises
            .readFile("./user.json", { encoding: "utf8" })
            .then((data) => JSON.parse(data));

        const remainUsers = users.filter((user) => user.id !== id);

        await fs.promises.writeFile("./user.json", JSON.stringify(remainUsers), {
            encoding: "utf8",
        });

        res.status(200).send({ message: "done" })

    } catch (error) {
        next({ status: 404, internalMessage: error.message });
    }

});

module.exports = router;
