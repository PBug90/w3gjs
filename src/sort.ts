interface SortablePlayer {
    teamid: number
    id: number
}

export const sortPlayers = (player1 : SortablePlayer, player2: SortablePlayer) => {
    if (player2.teamid > player1.teamid) return -1
    if (player2.teamid < player1.teamid) return 1

    if (player2.id > player1.id) return -1
    if (player2.id < player1.id) return 1

    return 0
}

  
