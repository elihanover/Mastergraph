import weave

// weave checks if resource exists, and if not, deploys it
var db = new Database('kv', { key: "date", value: "reported weather"})

// the same deployment process goes for functions
function pread() {
  console.log(database.scan())
}

function enter({
  frequency: "1 minute",
  timeout: "30 seconds"
}) {
  database.put({
    key: "08.31.2018", // but what is the key/hashkey?
    value: {
      weather: "sunny",
      reporter: "eli"
    }
  })
}

weave.add(db, pread, enter)
