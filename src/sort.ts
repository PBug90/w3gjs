import Player from "./Player";

type SortablePlayerProps = Pick<Player, "teamid" | "id">;

export const sortPlayers = (
  player1: SortablePlayerProps,
  player2: SortablePlayerProps
): number => {
  if (player2.teamid > player1.teamid) return -1;
  if (player2.teamid < player1.teamid) return 1;

  if (player2.id > player1.id) return -1;
  if (player2.id < player1.id) return 1;

  return 0;
};
