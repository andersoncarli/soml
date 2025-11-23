// utils/model.js - Simple database interface, with basic schema & validation.
// ! denotes a required field
// # denotes a unique field
// "autoinc" is a special value that indicates the field should be auto-incremented
module.exports = {
  User: {
    "id#": "autoinc",
    "name!": "",
    "email!#": ""
  },
  Post: {
    "id!#": "autoinc",
    "authorId!": 'User',
    "title!": "",
    "content!": "",
  },
  Task: {
    "id#": "autoinc",
    "userId!": 'User',
    "description!": "",
    "completed": false,
  },
  State: {
    "id#": "autoinc",
    "userId!": 'User',
    "state": {}
  }
}
// todo: create a model.nexId(className, data) to get a unique sequential id. to fulfill autoinc.
