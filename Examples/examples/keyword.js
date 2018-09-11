// weave checks if resource exists, and if not, deploys it
weave var db = new Database('kv', { key: "date", value: "reported weather"})

// the same deployment process goes for functions
weave function pread() {
  console.log(database.scan())
}

weave function enter({
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
