import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const publisherHost = "market-data-publisher";
const publisherPort = 3001;
export const socket: Socket = io(`http://${publisherHost}:${publisherPort}`);
export const SocketContext = createContext(socket);
