# Task summary

Note: If a task number is missing from the summary it is listed with a more detailed breakdown in the "Task breakdown" section.

## Onboard

- [ ] F1: Quick join public room If no ID
- [ ] F2: New public room if invalid room ID
- [ ] F3: Avatar customization options **[ medium, ui ]**
- [ ] F4: Random avatar generator **[ easy, ui ]**
- [ ] F5: Footer section having intro and rules **[ easy, ui ]**

## In game

- [ ] F7: Players settings
- [ ] F9: Sound effects and background music
- [ ] F10: Ban functionality

## Out of box **[ discussen needed ]**

- [ ] F11: Tutorial for new users
- [ ] F12: Spy Mode
- [ ] F13: AI generated words
- [ ] F16: Custom theme (eg. animals, fruits)
- [ ] F17: In game voice chat
- [ ] F18: powerups (eg. letter hint, blank other players for few sec)

---

# Task breakdown

- [ ] F6: Game room settings
  - [ ] T1: Custom words

- [ ] F8: Drawing Board
  - [ ] T1: Real-time drawing
  - [ ] T2: Drawing tools (colors, brush size, eraser)
  - [ ] T3: Undo/Redo functionality

- [ ] F14: Score calculation and display
  - [ ] T1: evaluate score based on time taken and guessed position
  - [ ] T2: evaluate score for the drawer based on number of players guessed and time taken

- [ ] F15: Timer for each round
  - [ ] T2: Hint after few seconds
  - [ ] T3: timer for word choosing by drawer

# Bugs

- [ ] B1: Client creates room and cannot type msg until any one joines.

# Possibliities

- [ ] P1: what if drawer left when he is choosing word?
      - make another player the drawer
- [ ] P2: what if drawer disconnects during drawing?
      - end the match with 0 score for everyone
- [ ] P3: what if all players left leaving one in the room during the match?
      - declare that player as winner and end the game
- [ ] P4: what if a player disconnects and all other players guessed the word?
      - end the match
