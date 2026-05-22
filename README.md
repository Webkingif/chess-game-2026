# Vanilla HTML/CSS/JS Implementation

This folder is reserved for a version of the chess game that does not rely on React or any build tools.

## How to transition from React to Vanilla:
1. **State Management**: Instead of `useState`, use a global `state` object and a `render()` function that clears the board and redraws it whenever the state changes.
2. **Event Handling**: Use `element.addEventListener('click', ...)` instead of `onClick` props.
3. **Components**: Replace React components with functions that return DOM elements or template strings.
4. **AI**: The `ChessAI` class can be used exactly as is, as it has no dependencies on React.
