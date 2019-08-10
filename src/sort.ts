import Player from './Player'

export const sortPlayers = (player1: Player, player2: Player) => {
    if (player2.teamid > player1.teamid) return -1
    if (player2.teamid < player1.teamid) return 1

    if (player2.id > player1.id) return -1
    if (player2.id < player1.id) return 1

    return 0
}
