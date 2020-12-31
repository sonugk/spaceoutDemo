const request = require('supertest');
const { app, server } = require('./index');

test('Login API Success Test', async () => {
    const res = await request(app).post('/login').send({ email: "test@gmail.com", pwd: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBe(undefined);
});

test('Login API Failure Test', async () => {
    const res = await request(app).post('/login').send({ email: "test@gmail.com", pwd: "123" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBe(undefined);
});

test('Facilities API Success Test', async () => {
    const res = await request(app).get('/facilities').set("authorization","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1ZjY4MTVhYjAyNDJiYTQxNDQ3ZDA3N2QiLCJpYXQiOjE2MDA2NTY4MjMsImV4cCI6MTYwMTUyMDgyM30.3pmTYCvxO6LBcBil8-RSmDfbDyRuzyxvnWjsn4fmdp4");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
});

test('Facilities API Failure Test', async () => {
    const res = await request(app).get('/facilities');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
});

test('CrowdLevels API Success Test', async () => {
    const res = await request(app).get('/crowdlevels').set("authorization","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1ZjY4MTVhYjAyNDJiYTQxNDQ3ZDA3N2QiLCJpYXQiOjE2MDA2NTY4MjMsImV4cCI6MTYwMTUyMDgyM30.3pmTYCvxO6LBcBil8-RSmDfbDyRuzyxvnWjsn4fmdp4");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
});

test('CrowdLevels API Failure Test', async () => {
    const res = await request(app).get('/crowdlevels');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
});
