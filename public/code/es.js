const es = require('elasticsearch');
const fs = require('fs');
const path = require('path');

const client = new es.Client({
  host: 'http://59.110.169.144:9200',
  // log: 'trace'
});

const JSON_PATH = '../../public/content.json';

function convertPosts2Docs(posts) {
  return posts.map(post => ({
    index: 'blog',
    type: 'article',
    id: post.title,
    body: {
      title: post.title,
      subtitle: post.subtitle || post.title,
      link: `/${post.path}`,
      content: post.text,
      create_date: post.date,
      update_date: post.updated
    }
  }));
}

function buildBody(post) {
  return {
    body: {
      title: post.title,
      subtitle: post.subtitle || post.title,
      link: `/${post.path}`,
      content: post.text,
      create_date: post.date,
      update_date: post.updated
    }
  }
}

function buildBulk(index, type, posts) {
  const bulk = [];
  posts.forEach(post => {
    bulk.push({
      index: {
        _index: index,
        _type: type,
        _id: post.title,
      }
    });
    bulk.push(buildBody(post));
  });
  return bulk;
}

function writeJson(jsonPath) {
  const filePath = path.resolve(__dirname, jsonPath);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`read file: ${filePath} failed!`);
      return;
    }
    const posts = JSON.parse(data);
    const bulk = buildBulk('blog', 'article', posts);
    client.bulk({
      body: bulk
    }).then(res => {
      let errorCount = 0;
      res.items.forEach(item => {
        if (item.index && item.index.error) {
          console.error(`${errorCount++} write failed: `, item.index.error);
        }
      });

      const total = res.items.length;
      console.log(`write done: ${total - errorCount}/${total} write successfully!`);
    })

  });
}

function clearDocs(index, type) {
  return client.deleteByQuery({
    index,
    type,
    body: {
      query: {
        match_all: {}
      }
    }
  }).then(res => {
    console.log(`delete done: ${res.deleted}/${res.total} delete successfully!`);
    return Promise.resolve(res);
  })
}

clearDocs('blog', 'article')
  .then(() => writeJson(JSON_PATH))
  .catch(err => console.error(error))






