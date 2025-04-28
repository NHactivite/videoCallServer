const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
let ready=new Array()
io.on("connection", (socket) => {
  socket.on("room:join", (data) => {
    const { email, room ,role} = data;
  
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id,role });
   
    socket.join(room);
    role==="recruiter"?ready.push(room):null

    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
  socket.on("check_ready", ({ room,socketId}) => {
    ready.includes(room)?io.to(socketId).emit("ready_request", {room:true}):io.to(socketId).emit("ready_request", {room:false})
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  socket.on("user:disconnect", ({ to,room }) => {
    
    ready = ready.filter(item => item !== room);  // Store the filtered array

   
    io.to(to).emit("user:disconnected");
  });

  socket.on("single_disconnect",({room})=>{
   
    ready = ready.filter(item => item !== room); 
  })
  
});
