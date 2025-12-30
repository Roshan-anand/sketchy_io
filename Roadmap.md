# Task summary

## Onboard

- [ ] F1: Quick join public room If no ID
- [ ] F2: New public room if invalid room ID
- [ ] F3: Avatar customization options **[ medium, ui ]**
- [ ] F4: Random avatar generator **[ easy, ui ]**
- [ ] F5: Footer section having intro and rules **[ easy, ui ]**

## In game

- [ ] F7: Sort players by score **[ easy ]**
- [ ] F8: (placeholder) — see Task breakdown
- [ ] F9: Real-time canvas
- [ ] F10: Drawing tools (colors, brush size, eraser)
- [ ] F11: Undo/Redo functionality
- [ ] F12: Score system based on time and number of players guessed
- [ ] F13: Hint after few seconds
- [ ] F16: Players settings
- [ ] F17: Sound effects and background music
- [ ] F18: Ban functionality

## Out of box **[ discussen needed ]**

- [ ] F19: Tutorial for new users
- [ ] F20: Spy Mode
- [ ] F21: AI generated words
- [ ] F22: Custom theme (eg. animals, fruits)
- [ ] F23: In game voice chat
- [ ] F24: powerups (eg. letter hint, blank other players for few sec)

---

# Task breakdown

- [ ] F6: Game room settings
  - [ ] T1: Custom words

- [ ] F14: Score calculation and display
  - [ ] T1: evaluate score based on time taken and guessed position
  - [ ] T2: evaluate score for the drawer based on number of players guessed and time taken

- [ ] F15: Timer for each round
  - [ ] T1: if certain percent of players guessed correctly then decrease the time for others

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
