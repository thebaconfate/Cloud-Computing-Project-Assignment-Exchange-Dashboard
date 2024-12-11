import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const publisherHost = "127.0.0.1";
const publisherPort = 3001;
export const socket: Socket = io(`http://${publisherHost}:${publisherPort}`);
export const SocketContext = createContext<Socket>(socket);
