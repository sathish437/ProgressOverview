import http from "http";
const request = (method, path, token, body) => new Promise((resolve, reject) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path,
    method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body || '')
    }
  };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => resolve({ status: res.statusCode, body: data }));
  });
  req.on('error', reject);
  if (body) req.write(body);
  req.end();
});
(async () => {
  try {
    const login = await request('POST', '/api/auth/login', null, JSON.stringify({ email: 'beni@gmail.com', password: '123456' }));
    const token = JSON.parse(login.body).token;
    const goalList = await request('GET', '/api/goals', token);
    const goals = JSON.parse(goalList.body);
    const goal = goals.find(g => g.id === 12);
    const payload = {
      ...goal,
      milestones: [
        ...goal.milestones,
        { id: 'temp-5', title: 'Final milestone', value: 0, done: false, isCustom: false }
      ]
    };
    const patch = await request('PATCH', `/api/goals/${goal.id}`, token, JSON.stringify(payload));
    console.log('PATCH', patch.status);
    console.log(patch.body);
  } catch (e) {
    console.error(e);
  }
})();
