// Ultra simple test
console.log('JavaScript is loading!');

const container = document.getElementById('app');
if (container) {
  container.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1 style="color: red;">🔥 BASIC TEST WORKING!</h1>
      <p>If you see this, the basic setup is working.</p>
      <p>Current URL: ${window.location.href}</p>
      <p>Container found: ${container ? 'YES' : 'NO'}</p>
    </div>
  `;
} else {
  document.body.innerHTML = '<h1 style="color: red;">NO #app CONTAINER FOUND!</h1>';
}