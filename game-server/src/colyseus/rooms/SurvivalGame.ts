// import { Room, Client } from "colyseus";
// import { GameState, Player } from "../schemas/GameState";

// export class SurvivalGameRoom extends Room<GameState> {
//   maxClients = 4; // Limit players per room

//   onCreate(options: any) {
//     console.log("Ghanian Poker Room Created!");

//     this.setState(new GameState());

//     this.onMessage("start_game", (client) => {
//       /**
//        * Implement this later
//        */
//     });

//     this.onMessage("play_card", (client, cardData) => {
//       console.log(`${client.sessionId} played a card:`, cardData);
//       // Handle game logic for played card here...
//       this.broadcast("card_played", cardData);
//     });
//   }

//   onJoin(client: Client, options: any) {
//     console.log(`${client.sessionId} joined the room.`);
    
//     const player = new Player();
//     player.id = client.sessionId;
//     player.username = options?.username|| `Player_${client.sessionId}`;
//     this.state.players.set(client.sessionId, player);

//     this.broadcast("player_joined", { id: player.id, name: player.username });
//   }

//   onLeave(client: Client) {
//     console.log(`${client.sessionId} left the room.`);
//     this.state.players.delete(client.sessionId);
//     this.broadcast("player_left", { id: client.sessionId });
//   }
// }
