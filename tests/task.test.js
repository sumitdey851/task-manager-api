const request = require('supertest')
const Task = require('../src/models/task')
const app = require('../src/app')
const { 
    userOne,
    userOneId,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
} = require('./fixtures/db')

//initialise database before every test
beforeEach(setupDatabase)

//test create task
test('Should create task for user', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Setup task test suite'
    })
    .expect(201)

    //Get task from database
    const task = await Task.findById(response.body._id)

    //Assert database change
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

//test GET /tasks
test('Should fetch tasks of current user', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)      //get tasks of userOne
    .send()
    .expect(200)                                                    //Assert correct response code

    expect(response.body.length).toEqual(2)                            //Assert correct number of tasks returned
})

//test delete task security
test('Should not allow unauthorized delete', async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})