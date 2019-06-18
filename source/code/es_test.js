const es = require('elasticsearch');

// connect to es
const client = new es.Client({
  host: 'http://59.110.169.144:9200',
  log: 'trace'
});

// generate DSL
const generateDSL = (keyword = '', start = 0) => ({
  index: 'blog',
  type: 'article',
  from: start,
  body: {
    query: {
      dis_max: {
        queries: [
          {
            match: {
              title: {
                query: keyword,
                minimum_should_match: '50%',
                boost: 4,
              }
            }
          },
          {
            match: {
              subtitle: {
                query: keyword,
                minimum_should_match: '50%',
                boost: 4,
              }
            }
          }, {
            match: {
              content: {
                query: keyword,
                minimum_should_match: '75%',
                boost: 4,
              }
            }
          }, {
            match: {
              tags: {
                query: keyword,
                minimum_should_match: '100%',
                boost: 2,
              }
            }
          }, {
            match: {
              categories: {
                query: keyword,
                minimum_should_match: '100%',
                boost: 2,
              }
            }
          }
        ],
        tie_breaker: 0.3
      }
    },
    highlight: {
      pre_tags: ['<b>'],
      post_tags: ['</b>'],
      fields: {
        title: {},
        content: {},
      }
    }
  }
});

// test search
client.search(generateDSL('input', 0));