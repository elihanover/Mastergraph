// weave checks if resource exists, and if not, deploys it
const weave = require('weaveapi')

var databae = new weave.Database({
  name: "databae", // ...needs to be same name as variable right now
  hashkey: "things",
  sortkey: "stuffs"
})

var thatwould = new weave.Lambda({
    name: "thatwould",
    http: {
      method: 'get',
      path: 'becool'
    },
    resources: [databae],
  },
  async function() {
    console.log("wellhello")
    let res = await databae.put({
      'things': 'hi',
      'stuffs': 'there',
      'err': 'magerrd'
    })
    console.log("res: " + res)
  }
)

// test function
var hopethis = new weave.Lambda({
    name: "hopethis",
    // frequency: "1 minute",
    http: {
      method: 'get',
      path: 'works'
    },
    resources: [thatwould],
  },
  async function(event, context, callback) {
    console.log("Test Passed")
    hopethis.trigger();
    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
        body: "<p>Hello world!</p>",
    })
    console.log("here")
  }
)

var testget = new weave.Lambda({
  name: "testget",
  resources: [databae]
},
async function() {
  console.log("errrr")
  let res = await databae.get({
    'things': 'hi',
    'stuffs': 'there'
  })
  console.log(res)
  console.log("magerrddd")
})

var testdel = new weave.Lambda({
  name: 'testdel',
  resources: [databae]
}, async function () {
  console.log('ohhhhhhh')
  let res = await databae.delete({
    'things': 'hi',
    'stuffs': 'there'
  })
  console.log(res)
  console.log('yeeaa')
})

var testset = new weave.Lambda({
  name: 'testset',
  resources: [databae]
}, async function() {
  console.log('start')
  let res = await databae.set({
    'things': 'bye',
    'stuffs': 'there'
  }, 'got', {'who': 'them'})
  console.log('done')
})

var testapp = new weave.Lambda({
  name: 'testapp',
  resources: [databae]
}, async function() {
  console.log('start')
  let res = await databae.append({
    'things': 'bye',
    'stuffs': 'there'
  }, 'got', 'them')
  console.log('done')
})

var testprep = new weave.Lambda({
  name: 'testprep',
  resources: [databae]
}, async function() {
  console.log('start')
  let res = await databae.prepend({
    'things': 'bye',
    'stuffs': 'there'
  }, 'got', 'eeeveryone')
  console.log('done')
})

var testadd = new weave.Lambda({
  name: 'testadd',
  resources: [databae]
}, async function() {
  console.log('start')
  let res = await databae.add({
    'things': 'bye',
    'stuffs': 'there'
  }, 'got', -1)
  console.log('done')
})

var set2 = new weave.Lambda({
  name: 'set2',
  resources: [databae]
}, async function() {
  console.log('start')
  let res = await databae.set({
    'things': 'bye',
    'stuffs': 'there'
  }, 'got.nest', ['hi'])
  console.log('done')
})

var set3 = new weave.Lambda({
  name: 'set3',
  resources: [databae]
}, async function() {
  console.log('start')
  let res = await databae.set({
    'things': 'bye',
    'stuffs': 'there'
  }, 'got.nest[0]', 'hello')
  console.log('done')
})

// Need:
//  - error handling, on failed request, dumb down message into why it crashed





module.exports = {databae, thatwould, hopethis, testget, testdel, testset, testapp, testprep, testadd, set2, set3}
