# SOML Project Guidelines

## Commands
- Test: `node src/test.js` or `node src/soml.test.js`
- Run server: `node src/server.js`
- Test single file: `node path/to/test.js`

## Code Style
- CommonJS modules (`require`/`module.exports`)
- 2-space indentation
- No semicolons (optional)
- Single quotes for strings
- camelCase for variables/functions
- PascalCase for models/classes
- Arrow functions preferred
- Group imports at top of file

## Architecture
- SOML framework in `src/soml.js`
- Model-driven architecture (see `model.js`)
- RESTful API routes in `src/routes/api/`
- Database abstraction in `src/abstractions/DB.js`

## Error Handling
- Try/catch for error-prone operations
- HTTP status codes for API errors
- Return null on failure for simple operations