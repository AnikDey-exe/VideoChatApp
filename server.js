const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");
var nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
        user: 'udoe162@gmail.com',
        pass: 'user12345!'
    },
    secure: true
})

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

app.post("/send-email", (req, res) => {
    const toEmail = req.body.to;
    const url = req.body.url;

    const mailData = {
        from: 'udoe162@gmail.com',
        to: 'deyanik2007@gmail.com',
        subject: 'Join my meeting now!',
        html: `<p> Hey there, </p> <p> Come and join my meeting! ${url} </p>`
    };

    transporter.sendMail(mailData, (err, info) => {
        if(err) {
            return console.log('error')
        }

        res.status(200).send({
            message: 'Sent',
            message_id: info.messageId
        })
    })
})

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, username) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message)=>{
            io.to(roomId).emit("createMessage", message, username)
        })
    });
});

server.listen(3030);