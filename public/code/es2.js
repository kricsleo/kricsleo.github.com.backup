const es = require('elasticsearch');

// connect to es
const client = new es.Client({
  host: 'http://59.110.169.144:9200',
  // log: 'trace'
});

// test connect
// client.info({})
//   .then(info => console.log(info), err => console.warn(err));
client.ping({
  requestTimeout: 3000
}).then(res => console.log('ping', res));

// client.indices.exists({
//   index: 'blog2'
// }).then(res => console.log('index', res));

// client.indices.existsType({
//   index: 'blog2',
//   type: 'article'
// }).then(res => console.log('type', res));

// add article index and type
// client.indices.create({
//   index: 'blog'
// }).then(() => {
//   client.indices.putMapping({
//     index: 'blog',
//     type: 'article',
//     body: {
//       properties: {
//         title: {
//           type: 'text',
//           term_vector: 'with_positions_offsets',
//           analyzer: 'ik_max_word',
//           search_analyzer: 'ik_max_word'
//         },
//         subtitle: {
//           type: 'text',
//           term_vector: 'with_positions_offsets',
//           analyzer: 'ik_max_word',
//           search_analyzer: 'ik_max_word'
//         },
//         content: {
//           type: 'text',
//           term_vector: 'with_positions_offsets',
//           analyzer: 'ik_max_word',
//           search_analyzer: 'ik_max_word'
//         },
//         link: {
//           type: 'text'
//         },
//         author: {
//           type: 'text',
//         },
//         categories: {
//           type: 'keyword',
//         },
//         tags: {
//           type: 'keyword',
//         },
//         create_date: {
//           type: 'date',
//           index: false
//         },
//         update_date: {
//           type: 'date',
//           index: false
//         }
//       }
//     }
//   });
// }).then(() => {
//   // write blog data into es
//   client.index({
//     index: 'blog',
//     type: 'article',
//     id: 'input-event/',
//     body: {
//       title: 'input event',
//       subtitle: 'input 元素的事件顺序',
//       author: 'kricsleo',
//       tags: ['js', 'h5'],
//       categories: ['front-end'],
//       content: '如果是组合输入(比如中文日文等)输入的话就会出现括号中组合输入事件, 详细来说是当开始输入中文的时候就会触发`compositionstart`事件, 此时`input`事件和`keyup`事件拿到的输入框的值是不完整的(一般包含你输入的拼音和拼音之间的分号), 当中文输入结束的时候会触发`compositionend`事件, 此时可以取到该输入框的完整的输入中文后的值(一般而言这个值是我们所需要的)',
//       create_date: '2015-12-15T13:05:55Z',
//       update_date: '2015-12-15T13:05:55Z',
//     }
//   })
// });

// generate DSL

// client.index({
//   index: 'blog',
//   type: 'article',
//   id: 'input-event2/',
//   body: {
//     title: 'input event2',
//     subtitle: 'input 元素的事件顺序',
//     link: '/input-event2',
//     author: 'kricsleo',
//     tags: ['js', 'h5'],
//     categories: ['front-end'],
//     content: '如果是组合输入(比如中文日文等)输入的话就会出现括号中组合输入事件, 详细来说是当开始输入中文的时候就会触发`compositionstart`事件, 此时`input`事件和`keyup`事件拿到的输入框的值是不完整的(一般包含你输入的拼音和拼音之间的分号), 当中文输入结束的时候会触发`compositionend`事件, 此时可以取到该输入框的完整的输入中文后的值(一般而言这个值是我们所需要的)',
//     create_date: '2015-12-15T13:05:55Z',
//     update_date: '2015-12-15T13:05:55Z',
//   }
// })

// const generateDSL = (query = '', start = 0) => ({
//   index: 'blog',
//   type: 'article',
//   from: start,
//   q: query,
//   body: {
//     query: {
//       dis_max: {
//         queries: [
//           {
//             match: {
//               title: {
//                 query: keyword,
//                 minimum_should_match: '50%',
//                 boost: 4,
//               }
//             }
//           },
//           {
//             match: {
//               subtitle: {
//                 query: keyword,
//                 minimum_should_match: '50%',
//                 boost: 4,
//               }
//             }
//           }, {
//             match: {
//               content: {
//                 query: keyword,
//                 minimum_should_match: '75%',
//                 boost: 4,
//               }
//             }
//           }, {
//             match: {
//               tags: {
//                 query: keyword,
//                 minimum_should_match: '100%',
//                 boost: 2,
//               }
//             }
//           }, {
//             match: {
//               categories: {
//                 query: keyword,
//                 minimum_should_match: '100%',
//                 boost: 2,
//               }
//             }
//           }
//         ],
//         tie_breaker: 0.3
//       }
//     },
//     highlight: {
//       pre_tags: ['<b>'],
//       post_tags: ['</b>'],
//       fields: {
//         title: {},
//         content: {},
//       }
//     }
//   }
// });

// test search
// client.search(generateDSL('input', 0));



