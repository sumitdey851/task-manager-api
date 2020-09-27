const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

//do this before running each test()
beforeEach(setupDatabase)

//test user creation
test('Should signup a new user', async () => {
    const response = await request(app)
    .post('/users')
    .send({
        name: 'Sumit',
        email: 'sumit@example.com',
        password: 'MyPass777!'
    })
    .expect(201)

    //Get user from the database
    const user = await User.findById(response.body.user._id)
    
    //Assert that the database has been changed
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Sumit',
            email: 'sumit@example.com'
        },
        token: user.tokens[0].token
    })
    
    //Assert plain-text password is not stored
    expect(user.password).not.toBe('MyPass777!')
})

//test user login
test('Should login existing user', async () => {
    const response = await request(app)
    .post('/users/login')
    .send({
        email: userOne.email, 
        password: userOne.password
    })
    .expect(200)

    //Get user from database
    const user = await User.findById(userOneId)

    //Assert new token is saved
    expect(response.body.token).toBe(user.tokens[1].token)
})

//test login authorization
test('Should not login non-existent credentials', async() => {
    await request(app)
    .post('/users/login')
    .send({
        email: 'sumit@example.com',
        password: 'MyPass777!'
    })
    .expect(400)
})

//test user profile fetch
test('Should get profile for user', async() => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

//test user profile fetch authorization
test('Should not get profile for unauthenticated user', async () =>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

//test delete user
test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

//test delete user authorization
test('Should not delete account for unauthorized user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

//test avatar upload
test('Should upload avatar image', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user = await User.findById(userOneId)

    expect(user.avatar).toEqual(expect.any(Buffer))
})

//test update user
test('Should update valid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Sumit'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.createdAt).not.toBe(user.updatedAt)
    expect(user.name).toBe('Sumit')
})

//test invalid update
test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Kolkata'
    })
    .expect(400)
})