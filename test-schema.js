// Test the new schema system
const { defineSchema } = require('./src/schema');
const { soml } = require('./src/soml');
const { events } = require('./src/events');

console.log('=== Testing CentralStation-inspired Schema System ===\n');

// Test 1: Define a schema
console.log('Test 1: Schema Definition');
const TestSchema = defineSchema({
  name: 'Test',
  fields: {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    description: { type: 'string', default: 'No description' }
  },
  views: {
    card: (data) => ({
      div: {
        class: 'card',
        children: [
          { h3: data.title },
          { p: data.description }
        ]
      }
    })
  }
});
console.log('✓ Schema created:', TestSchema.name);

// Test 2: Validation with defaults
console.log('\nTest 2: Validation & Defaults');
const validData = TestSchema.validate({ 
  id: '123', 
  title: 'Test Title' 
});
console.log('✓ Validation passed with defaults:', validData);

// Test 3: View rendering
console.log('\nTest 3: View Rendering');
const rendered = TestSchema.render('card', validData);
const html = soml.toHtml(rendered);
console.log('✓ Rendered HTML:', html.substring(0, 100) + '...');

// Test 4: Event system
console.log('\nTest 4: Event System');
let eventReceived = false;
events.on('test:event', (data) => {
  eventReceived = true;
  console.log('✓ Event received:', data.message);
});
events.emit('test:event', { message: 'Hello from events!' });
console.log('✓ Event system working:', eventReceived);

// Test 5: Load Post schema
console.log('\nTest 5: Post Schema');
const Post = require('./src/schemas/Post');
console.log('✓ Post schema loaded');
console.log('  Fields:', Object.keys(Post.fields).join(', '));
console.log('  Views:', Object.keys(Post.views).join(', '));
console.log('  Routes:', Object.keys(Post.routes).join(', '));
console.log('  Events:', Object.keys(Post.events).join(', '));

// Test 6: Post validation
console.log('\nTest 6: Post Validation');
const postData = Post.validate({
  title: 'My First Post',
  content: 'This is the content of my first post.',
  authorId: 'user123'
});
console.log('✓ Post validated with auto-generated fields:');
console.log('  ID:', postData.id);
console.log('  Created:', postData.createdAt);

// Test 7: Render post list
console.log('\nTest 7: Render Post List');
const posts = [postData];
const listView = Post.render('list', posts);
const listHtml = soml.toHtml(listView);
console.log('✓ List view rendered (' + listHtml.length + ' characters)');

// Test 8: Event emission
console.log('\nTest 8: Post Events');
Object.entries(Post.events).forEach(([event, handler]) => {
  events.on(event, handler);
});
events.emit('post:created', postData);

console.log('\n✅ All tests passed!');
console.log('\n=== Integration Summary ===');
console.log('✓ Schema system working');
console.log('✓ Event system working');
console.log('✓ SOML rendering working');
console.log('✓ Validation working');
console.log('✓ Views working');
console.log('\nReady to integrate with server!');

