const http = require('http');
http.get('http://localhost:3000/recruiter', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(res.statusCode));
}).on('error', (err) => console.log(err));
