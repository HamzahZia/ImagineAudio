const Lyricist = require('lyricist/node6');

const lyricist = new Lyricist('vncdvk6zRgcW5C4XMlNiSa9jT874FnwvLyMQrvzAe790BlSnOG62_3WAlvxduPn1');

var api = require('genius-api');
//var genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
var genius = new api('vncdvk6zRgcW5C4XMlNiSa9jT874FnwvLyMQrvzAe790BlSnOG62_3WAlvxduPn1');

//search
// genius.search('Kendrick').then(function(response) {
//     console.log('hits', response.hits);
// });

//get song
// genius.song(3039923).then(function(response) {
//     console.log('song', response.song.url);
// });

//
// const album = await lyricist.album(3039923, { fetchTracklist: true });
// console.log(album.songs);

//
// //get annotation
// genius.annotation(6737668).then(function(response) {
//     console.log(response.annotation);
// });
//
// //get referents by song_id, with options
// genius.referents({song_id: 378195}, {per_page: 2}).then(function(response) {
//     console.log('referents', response.referents);
// });
//
// //get referents by web_page_id, with options
// genius.referents({web_page_id: 10347}, {per_page: 5}).then(function(response) {
//     console.log('referents', response.referents);
// });
//
// //get song
// genius.song(378195).then(function(response) {
//     console.log('song', response.song);
// });
//
// //get artist
// genius.artist(16775).then(function(response) {
//     console.log('artist', response.artist);
// });
//
// //get web page, with options
// genius.webPage({raw_annotatable_url: 'https://docs.genius.com'}).then(function(response) {
//     console.log('web page', response.web_page);
// });
//
// //search
// genius.search('Run the Jewels').then(function(response) {
//     console.log('hits', response.hits);
// });
//
// //error handling á la promise
// genius.song(378195).then(function(response) {
//     console.log('song', response.song);
// }).catch(function(error) {
//     console.error(error);
// });
