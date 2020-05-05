import WebSocket from "ws";

export function isOpen(ws) {
    return  ws !== undefined && ws.readyState === WebSocket.OPEN;
}
export function isClosed(ws) {
    return  ws !== undefined && ws.readyState === WebSocket.OPEN;
}