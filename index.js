import dotenv from "dotenv";
import { Server } from "socket.io";
import express from "express";
import path from "path";
import logger from "morgan";
import http from "http";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { messageList } from "./storage.js";
dotenv.config();

export var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],

  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOpts));

export var server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let port = process.env.PORT;

app.set("port", port);
server.listen(port);
console.log("Server running on port " + port);

var publicNamespace;
const initChat = (io) => {
  console.log("running");
  publicNamespace = io.of("/public");
  publicNamespace.on("connection", (socket) => {

    socket.on("connection",(link)=>{
        console.log("user from ",link," connected")
        socket.emit("data", messageList.size === 0 ? [] : messageList.get(link))
    
        socket.on("message",async ({link,name,message})=>{
            let username = name.substring(0,4)+"..."+name.substring(name.length-4,name.length)
            // console.log(link,name,message)
            if(messageList.get(link)){
                messageList.set(link,[...messageList.get(link),{name:username,message:message,person:'https://stonegatesl.com/wp-content/uploads/2021/01/avatar-300x300.jpg'}])
            }else{
                messageList.set(link,[{name:username,message:message,person:'https://stonegatesl.com/wp-content/uploads/2021/01/avatar-300x300.jpg'}])
            }
            
            // console.log(messageList)
            socket.broadcast.emit("message",{name:username,message:message,person:'https://stonegatesl.com/wp-content/uploads/2021/01/avatar-300x300.jpg'})
    
        })
        
    })


  });
};

initChat(io);
