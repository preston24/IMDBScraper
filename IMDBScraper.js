const requestPromise = require('request-promise');
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;


//movie URLS
const URLS = [
  { url: 'https://www.imdb.com/title/tt0076759/?ref_=nv_sr_srsg_0',
    id: 'new_hope'
  }, 
  { url: 'https://www.imdb.com/title/tt0080684/?ref_=nv_sr_srsg_3',
    id: 'empire_strikes_back'
  },
  { url: 'https://www.imdb.com/title/tt0086190/?ref_=nv_sr_srsg_0',
    id: 'return_of_the_jedi'
  }
];


//scraper function 
(async () => {
  let movieData = [];

  for(let movie of URLS) {
    const response = await requestPromise({
      uri: movie.url,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'referer': 'https://www.imdb.com/video/vi1236926745?playlistId=tt0090728&ref_=tt_ov_vi',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
      },
      gzip: true
    });

    let $ = cheerio.load(response);

    let title = $('div[class="title_wrapper"] > h1').text().trim();
    let rating = $('div[class="ratingValue"] > strong > span').text();
    let poster = $('div[class="poster"] > a > img').attr('src');
    let totalRatings = $('div[class="imdbRating"] > a').text();
    let releaseDate = $('a[title="See more release dates"]').text().trim();

    let genres = [];
    $('div[class="title_wrapper"] a[href^="/search/"]').each((i, elm) => {
      let genre = $(elm).text();

      genres.push(genre);
    });

    movieData.push({
      title,
      rating,
      poster,
      totalRatings,
      releaseDate,
      genres
    })


    // download and save movie poster
    let file = fs.createWriteStream(`${movie.id}.jpg`);

    await new Promise((resolve, reject) => {
    let stream = request({
      uri: poster,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'cache-control': 'max-age=0',
        'referer': 'https://www.imdb.com/video/vi1236926745?playlistId=tt0090728&ref_=tt_ov_vi',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36',
      },
      gzip: true
    })
    .pipe(file)
    .on('finish', () => {
      console.log(`${movie.id} has finished downloading the image.`);
      resolve();
    })
    .on('error', (error) => {
      reject(error);
    })
  })
  .catch(error => {
    console.log(`${movie.id} has an error on download ${error}`);
  });

}
  // console.log(movieData);


  //saves data as JSON/CSV
  // const json2csvParser = new Json2csvParser();
  // const csv = json2csvParser.parse(movieData);

  // JSON file 
  // fs.writeFileSync('./data.json', JSON.stringify(movieData), 'utf-8');

  // CSV file
  // fs.writeFileSync('./data.csv', csv, 'utf-8');

  // console.log(csv);
})()