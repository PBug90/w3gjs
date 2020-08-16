import { W3MMDAction } from "./parsers/ActionParser";

export default class W3MMDHandler {
  handleAction(action: W3MMDAction, playerId: number): void {
    const actionType = action.key.split(" ", 1)[0];
    console.log(actionType, action.key, playerId);
    if (action.missionKey.startsWith("chk:")) {
      return;
    }
    switch (actionType) {
      case "init":
        break;
      case "DefVarP":
        break;
      case "VarP":
        break;
      case "FlagP":
        break;
      case "DefEvent":
        break;
      case "Event":
        break;
      case "Blank":
        break;
      default:
        console.log("Unknown w3mmd action");
        break;
    }
  }
}
