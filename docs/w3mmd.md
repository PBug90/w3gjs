Warcraft 3 Map Meta Data Standard
Version 1.00

**Introduction**
This standard defines a common language which warcraft 3 maps can use to communicate meta data to replay parsers, hosting bots, and possibly other tools.

All strings are case-sensitive.
Parsers should keep in mind the case of a player's name may differ from game to game.

**Message Format**
- The sub-packets carrying messages in the game data have the format byte 0x6B, string filename, string mission_key, string key, dword value.
- The strings are all null-terminated, and dwords are little-endian.
- Messages can be identified by the surrounding pattern: kMMD.Dat[null]val:[decimal-number][null][message contents][null][dword]"
- Checksum messages can be identified by the surrounding pattern: kMMD.Dat[null]chk:[decimal-number][null][decimal-number][null][dword]"
- Message ids start at 0 and increase by 1 for each message. IDs become very important in cases where cheaters try to fake messages.
- Messages are composed of a sequence of arguments separated by non-escaped spaces.
- Escape sequences are '\ ' for ' ' (space), '\\' for '\' (backslash).
- The dword value in the message is a weak checksum for the message. The parser does not need to know how to generate the checksum, as it is mainly used by the wc3 client to detects forgeries.
- A message must be followed by a checksum message with the message contents replaced by the msg id.
- The purpose of the checksum message is to allow friendly clients to detect tampering, and ultimately is only required because of the limitations of wc3 JASS.
- An example of data containing a message with checksum:
...
kMMD.Dat[null]val:0[null]init version 0 0[null][0xFFFFFFFF]
...
kMMD.Dat[null]chk:0[null]0[null][0xFFFFFFFF]
...

**Message Protocol**
It is relatively easy for clients to fake messages from the map. Security is built into the protocol as follows:
- Each individual message is sent by one or more players chosen at random (by the wc3 clients).
- All friendly wc3 clients will check the sent message checksum at a random time between ~7s to ~11s later (in game time), and send the correct message if it differs from what they expected.
- After a checksum fail is detected by the clients, the number of players sending messages will increase to dilute the abilities of cheaters.
- The parser is free to award loses, deduct values from variables, erase stats, and generally screw with players caught cheating.
- If a player sends multiple different messages with the same id, that player is cheating.
- If a player sends a message with id N more than 12 game seconds after at least one message is received for each id from 0 to N, the message should be ignored. (The player is lagging or cheating)
- If a player sends two messages out of order, that player is cheating. Note that due to network delay this does not apply to two messages sent from two players. Apply reasonable limits for that situation.
- If players disagree on the message for an id, some of the players are probably cheating, but it is up to the parser to decide what exactly identifies a cheater in this situation.
- Possible strategies a parser can use to identify the 'correct' message in the event of disagreement [you already know someone is cheating, but you need to know what the real message is]:
  - Don't trust the players already identified as cheaters
  - Use a majority vote
  - Just ignore the message (not that cheaters may take advantage of ignoring messages to cancel important messages like "the other team won")
  - If no players contradict a multiple-message from one player, accept the last message sent before the check interval
  - Just accept the new message [easy, but abusable]
  - Pick one of the messages at random [almost as easy, slightly less abusable]
  - Remember the goal is to make cheating hard without punishing real players

**Message Types**
- init
Description: Provides initialization data.
Arguments: Sub Message, [Sub Type Arguments ...]
- Sub Message: Defines the initialization data being provided. Allowed values are "pid", "version".
- pid [id name]:
- Provides the game's player id and the name of the player the ID is associated with.
- The id will be used to reference the player in other messages.
- version [minimum current]:
- Provides the minimum version of the standard the map is compatible with, and the version the map is using
- Must be the first value the map emits.
Example1: init pid 0 Strilanc
Example2: init version 1 1

- DefVarP
Description: Defines a player variable.
- Integer and real variables have initial value 0.
- Strings have initial value "" (the empty string).
Arguments: Name, Value Type, Goal Type, Suggestion
- Name: The variable's name. Should be non-empty and no more than 32 characters in length (escape sequences count as only 1 character).
- Value Type: The variable's type. Allowed types are "real", "int" and "string".
- Goal Type: Defines the sort order on the variable [better to have high or low values]. Allowed values are "high", "low", and "none".
- Suggestion: A suggestion for what the parser should do for tracking the value. Allowed values are "none", "track", "leaderboard".
Example1: DefVarP hero_kills int high leaderboard
Example2: DefVarP hero_deaths int low leaderboard
Example3: DefVarP gold_earned int high track

- VarP
Decription: Changes the value of a player variable.
Arguments: Variable PID, Name, Operation, Value
- Variable Name: The name of the variable to modify.
- PID: The PID of the player for which the variable will be modified.
- Operation: The operation to apply to the variable. Allowed values are "=", "+=", "-=". Only "=" is allowed for strings.
- Value: The value to use when applying the operation.
Example: VarP 0 kills += 1

- FlagP
Description: Sets a player flag.
Arguments: PID, Flag
- PID: The PID of the player to affect.
- Flag: The flag to set. Allowed values are "winner", "loser", "drawer", "leaver", "practicing".
  - Only the last winner/loser/drawer flag matters. A player does not receive 2 wins if 'winner' is sent twice.
- All flags still count if the player has already left the game.
  - The 'leaver' flag is independent of the winner/loser/drawer flags, and is used to indicate a player left at a "non-appropriate" time.
  - The 'practicing' flag disables all stat tracking for the player for the game. The effect on the player's stats should be as if the game had never been played.
- If winner/loser/drawer is not specified the parser is free to choose the game outcome. It can use other data to infer the outcome, default to a draw, ignore the game, etc.
Example1: FlagP 0 winner
Example2: FlagP 0 leaver
Example2: FlagP 1 practicing

- DefEvent
Description: Defines the display format and number of arguments to an event.
Arguments: name, #args, arguments, format
- name: The name of the event.
- #args: The number of arguments this event will have.
- format: The format string used for this event. {0} means first argument, {1} means 2nd, etc. Use {#:player} to convert PID args to player names.
- arguments: the names of each of the arguments. Special format: prefix with "pid:" to indicate argument is a player ID.
Example1: DefEvent winround 2 team round Team\ {0}\ wins\ round\ {1}.
Example2: DefEvent kill 2 pid:killer pid:victim {0}\ killed\ {1}

- Event
Description: Leaves an event in the log. Events are meant to represent things which can be combined and counted. Eg. 'X kills Y' naturally defines 'number of kills by X' and 'number of times Y killed'.
Arguments: name, args
- name: The name of an already-defined event.
- args: The arguments to use in the event's format string.
Example1: Event winround east 1
Example2: Event kill 0 5

- Blank
Description: A non-message used by clients to drown out cheaters preemptively sending messages.
Arguments: none
Example1: blank
Example2: blank
Example3: blank
Example4: blank
Example5: blank
Example35463: blank

- Custom
Description: A message whose contents are not defined by the standard. The parser should ignore these messages unless it understands what they mean.
Arguments: idstring, data...
- idstring: A hopefully unique string which should allow customized parsers to recognize formats they understand.
- data...: The remaining data for the custom message. May be composed of multiple words.
Example: Custom DotA_League_Format Ban 4