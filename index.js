const redis = require('redis');
const axios = require('axios');
const express = require('express')

const SDCcache = redis.createClient();
SDCcache.on('connect', function() {
  console.log('Redis SDCcache Connected!');
});

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/reviews', (req, res) => {
  const product_id = req.query.product_id;
  const count = Number(req.query.count) || 5;
  const page = Number(req.query.page) || 1;
  console.log(count, page)
  SDCcache.get(product_id, (err, reply) => {
    if(reply === null) {
      axios.get(`http://sdcbalancer-1315321584.us-east-2.elb.amazonaws.com:5000/reviews?product_id=${product_id}`)
      .then(response => {
        const data = response.data.results;
        const dataRes = data.slice(count * (page - 1) , (count * (page - 1)) + count)
        res.json(dataRes)
        SDCcache.set(product_id, JSON.stringify(data))
      })
    } else {
      const data = JSON.parse(reply)
      const dataRes = data.slice(count * (page - 1) , (count * (page - 1)) + count)
      res.json(dataRes)
    }
 
  })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})