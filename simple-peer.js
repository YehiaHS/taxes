// Simple peer-to-peer connection using WebRTC without external dependencies
class SimplePeer {
    constructor() {
        this.id = this.generateId();
        this.connections = new Map();
        this.onopen = null;
        this.onconnection = null;
        this.onerror = null;
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ];
        
        // Simulate async initialization
        setTimeout(() => {
            if (this.onopen) this.onopen(this.id);
        }, 100);
    }
    
    generateId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    on(event, callback) {
        if (event === 'open') this.onopen = callback;
        else if (event === 'connection') this.onconnection = callback;
        else if (event === 'error') this.onerror = callback;
    }
    
    connect(peerId) {
        const conn = new PeerConnection(this, peerId);
        this.connections.set(peerId, conn);
        return conn;
    }
}

class PeerConnection {
    constructor(peer, peerId) {
        this.peer = peer;
        this.peerId = peerId;
        this.open = false;
        this.dataChannel = null;
        this._onopen = null;
        this._ondata = null;
        this._onclose = null;
        
        // Simulate connection establishment
        this.connect();
    }
    
    connect() {
        // Simulate WebRTC connection (in a real scenario, you'd use signaling server)
        setTimeout(() => {
            this.open = true;
            if (this._onopen) this._onopen();
            
            // Store connection for bidirectional communication
            window.peerConnections = window.peerConnections || {};
            window.peerConnections[this.peerId] = this;
        }, 500 + Math.random() * 500);
    }
    
    on(event, callback) {
        if (event === 'open') this._onopen = callback;
        else if (event === 'data') this._ondata = callback;
        else if (event === 'close') this._onclose = callback;
    }
    
    send(data) {
        if (!this.open) {
            console.warn('Connection not open yet');
            return;
        }
        
        // Simulate sending data (in real scenario, use dataChannel.send)
        // For demo, we'll store in a shared location
        window.peerMessages = window.peerMessages || [];
        window.peerMessages.push({
            from: this.peer.id,
            to: this.peerId,
            data: data,
            timestamp: Date.now()
        });
        
        // Simulate receiving on the other end
        setTimeout(() => {
            const otherConn = window.peerConnections?.[this.peer.id];
            if (otherConn && otherConn._ondata) {
                otherConn._ondata(data);
            }
        }, 10 + Math.random() * 40);
    }
    
    close() {
        this.open = false;
        if (this._onclose) this._onclose();
        if (this.peer && this.peer.connections) {
            this.peer.connections.delete(this.peerId);
        }
    }
}

// Export as Peer for compatibility
window.Peer = SimplePeer;
