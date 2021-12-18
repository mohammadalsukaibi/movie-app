let movies;
let topMovie;
let searchMovies;
let topMovies;
let currentIndex = 4;
let moviedb_api_key = config.moviedb_api_key
 
// movie genres
let horrorMovies;

let guest_session_id;
let rated_movies;

let oldFavorites = JSON.parse(localStorage.getItem("favorites"));




if (localStorage.getItem("guest_session_id") == null){
    
    // give the user guest session id
    axios.get(`https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${moviedb_api_key}`)
    .then(function (response) {
        console.log(response.data.guest_session_id);
        guest_session_id = response.data.guest_session_id;
        localStorage.setItem("guest_session_id", guest_session_id)
        getMovie();
        getTopMovies();
        getHorrorMovies();
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}else{
    guest_session_id = localStorage.getItem("guest_session_id");
    axios.get(`https://api.themoviedb.org/3/guest_session/${guest_session_id}/rated/movies?api_key=${moviedb_api_key}&language=en-US&sort_by=created_at.asc&page=1`)
    .then(function (response){
        rated_movies = response.data.results
        getMovie();
        getTopMovies();
        getHorrorMovies();
    })
}



async function getMovie() {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/trending/movies/week?api_key=${moviedb_api_key}`);
        movies = response.data.results;
        console.log(movies)
        if (document.querySelector('.m-cards') != null){
            const cards = document.querySelector('.m-cards')
            cards.innerHTML = ""
            movies.slice(1,5).map(showMovies);
            topMovie = movies[0];
            showFirstMovie(topMovie);
        } else if (document.querySelector('.popular-cards') != null){
            const cards = document.querySelector('.popular-cards')
            cards.innerHTML = ""
            movies.map(showMovies);
        }
        
    } catch (error) {
        console.error(error);
    }
}

async function getTopMovies() {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${moviedb_api_key}&language=en-US&page=1`);
        topMovies = response.data.results;
        if (document.querySelector('.top-cards') != null){
            const cards = document.querySelector('.top-cards')
            cards.innerHTML = ""
            topMovies.slice(0,4).map(showTopMovies);
        } else if (document.querySelector('.top-page-cards') != null){
            const cards = document.querySelector('.top-page-cards')
            cards.innerHTML = ""
            topMovies.map(showTopMovies);
        }

        
    } catch (error) {
        console.error(error);
    }
}

async function getHorrorMovies() {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${moviedb_api_key}&with_genres=27`);
        horrorMovies = response.data.results;
        if (document.querySelector('.horror-cards') != null){
            const cards = document.querySelector('.horror-cards')
            cards.innerHTML = ""
            horrorMovies.slice(0,4).map(showHorrorMovies);
        }else if(document.querySelector('.horror-page-cards') != null){
            const cards = document.querySelector('.horror-page-cards')
            cards.innerHTML = ""
            horrorMovies.map(showHorrorMovies);
        }
        
    } catch (error) {
        console.error(error);
    }
}

// movie page

async function addRating(id){
    console.log(id)
    const { value: rating } = await Swal.fire({
        title: 'Input your rating',
        input: 'range',
        inputAttributes: {
            min: 0,
            max: 10,
            step: 0.5
        },
        inputValue: 0
      })

    axios.post(`https://api.themoviedb.org/3/movie/${id}/rating?api_key=${moviedb_api_key}&guest_session_id=${guest_session_id}`, {
        value: rating
    })
    .then(function (response) {
        console.log(response)
        document.querySelector(".ratingBtn").innerHTML = rating
        Swal.fire({
            icon: 'success',
            title: 'Rating has been updated',
          })
    })
    .catch(function (error) {
        console.log(error);
    });

}

function getMovieDetails(id){
    sessionStorage.setItem("movieID", JSON.stringify(id))
    window.location = "movie.html";
}

function showMovieDetails(){
    guest_session_id = localStorage.getItem("guest_session_id");
    axios.get(`https://api.themoviedb.org/3/guest_session/${guest_session_id}/rated/movies?api_key=${moviedb_api_key}&language=en-US&sort_by=created_at.asc&page=1`)
    .then(function (response){
        rated_movies = response.data.results
        movieDetailsPage();
    })
    
}

function movieDetailsPage(){
    let movie_id = JSON.parse(sessionStorage.getItem("movieID")) 
    let item;
    axios.get(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${moviedb_api_key}&language=en-US`)
    .then(function (response) {
        console.log(response.data);
        item = response.data
        console.log(rated_movies)
        let position = positionOfObject(item, rated_movies);
        //genres
        function showGenres(element){
            return `<h2 class="border rounded-full text-center bg-gray-800 w-36 p-1 text-white">${element.name}</h2>`
        }
        document.querySelector(".movie-hero").innerHTML = `
        <img src="https://image.tmdb.org/t/p/original${item.backdrop_path}" alt="" class="h-full w-full object-cover absolute">
        <div class="w-full h-full bg-opacity-40 bg-gradient-to-r from-black via-transparent to-black absolute"></div>
        `
        document.querySelector(".movie-container").innerHTML = `
        <section class="text-gray-400 bg-gray-900 body-font">
            <div class="container mx-auto flex px-5 py-20 md:flex-row flex-col">
                <div class="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 md:mb-0 mb-10">
                <img class="object-cover object-center rounded w-3/4 mx-auto" alt="hero" src="https://image.tmdb.org/t/p/original${item.poster_path}">
                </div>
                <div class="lg:flex-grow md:w-1/2 lg:pl-10 md:pl-16 flex flex-col md:items-start md:text-left text-center pt-14">
                <h1 class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white">${item.original_title}</h1>
                <span class="flex mb-5">
                    <h2 class="mr-10">${item.release_date}</h2>
                    <h2 class="mr-10">${item.runtime} minutes</h2>
                </span>
                <p class="mb-8 leading-relaxed">${item.overview}</p>
                <span class="flex mb-10">
                    ${item.genres.map(showGenres)}
                </span>
                <div class="flex justify-center">
                    <button onclick="test(${item.id})" class="detail-like favoriteBtn w-14 flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-900 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                                            ${containsObject(item, oldFavorites) ? `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>` : `<i class="fas fa-heart mx-auto"></i>`}
                    </button>
                    ${position !== false ? `<button onclick="addRating(${item.id})" class=" ratingBtn ml-4 inline-flex text-white bg-blue-900 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">${rated_movies[position].rating}</button>` : `<button onclick="addRating(${item.id})" class="ratingBtn ml-4 inline-flex text-white bg-blue-900 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">Add your rating</button>`}
                    <button onclick="window.location.href='https://www.imdb.com/title/${item.imdb_id}/'" class=" ratingBtn ml-4 inline-flex text-white bg-blue-900 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">IMDB</button>
                </div>
                </div>
            </div>
        </section>
        `

        axios.get(`https://api.themoviedb.org/3/movie/${movie_id}/videos?api_key=${moviedb_api_key}&language=en-US`)
        .then(function (response){
            document.querySelector(".videos-container").innerHTML = `
            <div>
            <h1 class="text-4xl text-white font-bold">Videos</h1>
            <div class="bg-red-700 h-1 w-20 mt-2 mb-4"></div>
        </div>
        <div class="videos flex flex-wrap space-x-8">

        </div><br>`
            console.log(response)
            for (let i = 0; i < 3; i++) {
                console.log(response.data.results[i].key)
                document.querySelector(".videos").innerHTML += `<iframe width="420" height="345" src="https://www.youtube.com/embed/${response.data.results[i].key}">
                </iframe>`
              }
        })
    })
}


// searching
document.querySelector('.searchBtn').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      let userInput = document.querySelector('.searchBtn').value;
      axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${moviedb_api_key}&language=en-US&query=${userInput}&page=1`)
    .then(res => {
        searchMovies = res.data.results;
        document.querySelector('.search').innerHTML = `<div class="container mx-auto">
                                                            <h1 class="text-4xl text-white font-bold text-center md:mt-10">Search results for: ${userInput}</h1>
                                                            <div class="search-results flex flex-wrap -m-4">
                                                                
                                                            </div>
                                                        </div>`
        searchMovies.map(showCustomMovies);
        document.querySelector('.all-cards').style.visibility = 'hidden'
        document.querySelector('.home-hero').style.visibility = 'hidden'
    })
    .catch(err => {
        // Handle Error Here
        console.error(err);
    });
    }
});


// add to favorites
function test(id){

    let cards = document.querySelector('.m-cards')
    let top_cards = document.querySelector('.top-cards')
    let horror_cards = document.querySelector('.horror-cards')
    let movie_category = "";

    if (movies.find(o => o.id === id)  != undefined){
        console.log(" in movies")
        obj = movies.find(o => o.id === id);
        movie_category = "movies"
    }else if(topMovies.find(o => o.id === id) != undefined){
        console.log(" in top movies")
        obj = topMovies.find(o => o.id === id);
        movie_category = "top_movies"
    }else if(horrorMovies.find(o => o.id === id) != undefined){
        obj = horrorMovies.find(o => o.id === id);
        movie_category = "horror_movies"
    }else if(searchMovies.find(o => o.id === id) != undefined){
        console.log(" in search movies")
        obj = searchMovies.find(o => o.id === id);
        movie_category = "search_movies"
    }
    // get the local storage then add new to it then set it
    if(localStorage.getItem("favorites") != null){
        oldFavorites = JSON.parse(localStorage.getItem("favorites"));
        // if there is only one movie in localstorage
        if(oldFavorites[0] == undefined){
            console.log("more than one")
        }else{
            // more than one movie
            if(containsObject(obj, oldFavorites) == true){
                // remove it
                oldFavorites.splice(positionOfObject(obj, oldFavorites),1)
                localStorage.setItem("favorites", JSON.stringify(oldFavorites))
                switch (movie_category) {
                    case 'movies': 
                    if(window.location.href.indexOf("index.html") > -1){
                        cards = document.querySelector('.m-cards')
                        cards.innerHTML = ""
                        movies.slice(1,5).map(showMovies);
                        showFirstMovie(topMovie);
                    }else if(window.location.href.indexOf("popular.html") > -1){
                        cards = document.querySelector('.popular-cards')
                        cards.innerHTML = ""
                        movies.map(showMovies);
                    }else if(window.location.href.indexOf("movie.html") > -1){
                        document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto"></i>`
                        
                    }
                    break;
                 
                    case 'top_movies': 
                    if(window.location.href.indexOf("index.html") > -1){
                            top_cards.innerHTML = ""
                            topMovies.slice(0,4).map(showTopMovies);
                    }else if(window.location.href.indexOf("top.html") > -1){
                        cards = document.querySelector('.top-page-cards')
                        cards.innerHTML = ""
                        topMovies.map(showTopMovies);
                    }else if(window.location.href.indexOf("movie.html") > -1){
                        document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto"></i>`
                        
                    }
                    break;
                 
                    case 'horror_movies': 
                    if(window.location.href.indexOf("index.html") > -1){
                        horror_cards.innerHTML = ""
                        horrorMovies.slice(0,4).map(showHorrorMovies);
                    }else if(window.location.href.indexOf("horror.html") > -1){
                        cards = document.querySelector('.horror-page-cards')
                        cards.innerHTML = ""
                        horrorMovies.map(showHorrorMovies);
                    }else if(window.location.href.indexOf("movie.html") > -1){
                        document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto"></i>`
                        
                    }
                    break;

                    case 'search_movies': 
                    let all_cards = document.querySelector('.search-results')
                    all_cards.innerHTML = "";
                    searchMovies.map(showCustomMovies);
                    break;
                 
                    default:  console.log("Unknown movie category")
                }
                
                return;
            }   
            // add it
            oldFavorites.push(obj)
            localStorage.setItem("favorites", JSON.stringify(oldFavorites))
            // change color of the button
            switch (movie_category) {
                case 'movies': 
                if(window.location.href.indexOf("index.html") > -1){
                    cards = document.querySelector('.m-cards')
                    cards.innerHTML = ""
                    movies.slice(1,5).map(showMovies);
                    showFirstMovie(topMovie);
                }else if(window.location.href.indexOf("popular.html") > -1){
                    cards = document.querySelector('.popular-cards')
                    cards.innerHTML = ""
                    movies.map(showMovies);
                }else if(window.location.href.indexOf("movie.html") > -1){
                    document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>`
                    
                }
                break;
             
                case 'top_movies': 
                if(window.location.href.indexOf("index.html") > -1){
                        top_cards.innerHTML = ""
                        topMovies.slice(0,4).map(showTopMovies);
                }else if(window.location.href.indexOf("top.html") > -1){
                    cards = document.querySelector('.top-page-cards')
                    cards.innerHTML = ""
                    topMovies.map(showTopMovies);
                }else if(window.location.href.indexOf("movie.html") > -1){
                    document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>`
                    
                }
                break;
             
                case 'horror_movies': 
                if(window.location.href.indexOf("index.html") > -1){
                    horror_cards.innerHTML = ""
                    horrorMovies.slice(0,4).map(showHorrorMovies);
                }else if(window.location.href.indexOf("horror.html") > -1){
                    cards = document.querySelector('.horror-page-cards')
                    cards.innerHTML = ""
                    horrorMovies.map(showHorrorMovies);
                }else if(window.location.href.indexOf("movie.html") > -1){
                    document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>`
                    
                }
                break;

                case 'search_movies': 
                let all_cards = document.querySelector('.search-results')
                all_cards.innerHTML = "";
                searchMovies.map(showCustomMovies);
                break;
             
                default:  console.log("Unknown movie category")
            }
            
              
        }
        
    }else{
        // empty
        oldFavorites = [];
        // gg.push(oldFavorites);use olf fav
        oldFavorites.push(obj)
        localStorage.setItem("favorites", JSON.stringify(oldFavorites))
        // change color of the button
        console.log(movie_category)
        switch (movie_category) {
            case 'movies': 
            if(window.location.href.indexOf("index.html") > -1){
                console.log("gdgfds")
                cards = document.querySelector('.m-cards')
                cards.innerHTML = ""
                movies.slice(1,5).map(showMovies);
                showFirstMovie(topMovie);
            }else if(window.location.href.indexOf("popular.html") > -1){
                cards = document.querySelector('.popular-cards')
                cards.innerHTML = ""
                movies.map(showMovies);
            }else if(window.location.href.indexOf("movie.html") > -1){
                document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>`
                
            }
            break;
         
            case 'top_movies': 
            if(window.location.href.indexOf("index.html") > -1){
                    top_cards.innerHTML = ""
                    topMovies.slice(0,4).map(showTopMovies);
            }else if(window.location.href.indexOf("top.html") > -1){
                cards = document.querySelector('.top-page-cards')
                cards.innerHTML = ""
                topMovies.map(showTopMovies);
            }else if(window.location.href.indexOf("movie.html") > -1){
                document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>`
                
            }
            break;
         
            case 'horror_movies': 
            if(window.location.href.indexOf("index.html") > -1){
                horror_cards.innerHTML = ""
                horrorMovies.slice(0,4).map(showHorrorMovies);
            }else if(window.location.href.indexOf("horror.html") > -1){
                cards = document.querySelector('.horror-page-cards')
                cards.innerHTML = ""
                horrorMovies.map(showHorrorMovies);
            }else if(window.location.href.indexOf("movie.html") > -1){
                document.querySelector('.detail-like').innerHTML = `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>`
                
            }
            break;

            case 'search_movies': 
            let all_cards = document.querySelector('.search-results')
            all_cards.innerHTML = "";
            searchMovies.map(showCustomMovies);
            break;
         
            default:  console.log("Unknown movie category")
        }
        

    }
    

}
 
// ui
function showMovies(item){
    let cards;
    if(window.location.href.indexOf("index.html") > -1){
        cards = document.querySelector('.m-cards')
    }else if(window.location.href.indexOf("popular.html") > -1){
        cards = document.querySelector('.popular-cards')
    }   
    

    cards.innerHTML += `<div class="xl:w-1/4 md:w-1/2 p-4">
                            <div class="rounded-xl w-64">
                                <a onclick="getMovieDetails(${item.id})">
                                    <img class="h-full w-64 mx-auto rounded object-cover object-center mb-6" src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="content">
                                </a>
                                <h2 class="h-14 text-lg text-white font-medium title-font mb-4">${item.title ? item.title : item.name}</h2>
                                <button onclick="test(${item.id})" class="favoriteBtn w-10 flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-900 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                                    ${containsObject(item, oldFavorites) ? `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>` : `<i class="fas fa-heart mx-auto"></i>`}
                                </button>
                            </div>
                        </div>`
    
}

function showFirstMovie(item){
    let cards;
    if(window.location.href.indexOf("index.html") > -1){
        document.querySelector('.home-hero').innerHTML = 
        `
        <img src="https://image.tmdb.org/t/p/original${item.backdrop_path}" alt="" class="h-full w-full object-cover absolute">
        <div class="w-full h-full opacity-90 bg-gradient-to-r from-black via-black absolute"></div>
        <div class="absolute w-1/2 h-full flex flex-col space-y-10 pl-10 pt-32">
            <div class="bg-blue-900 rounded w-20 h-10 "><h1 class="font-semibold text-center pt-1 text-xl">Top #1</h1></div>
            <h1 class="text-white text-5xl uppercase">${item.title ? item.title : item.name}</h1>
            <p class="mb-8 leading-relaxed">${item.overview}</p>
            <button onclick="test(${item.id})" class="favoriteBtn w-10 flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-900 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                                    ${containsObject(item, oldFavorites) ? `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>` : `<i class="fas fa-heart mx-auto"></i>`}
                                </button>
        </div>
        `
    }
    
    
    
}

function showTopMovies(item){
    let cards;
    if(window.location.href.indexOf("index.html") > -1){
        cards = document.querySelector('.top-cards')
    }else if(window.location.href.indexOf("top.html") > -1){
        cards = document.querySelector('.top-page-cards')
    }
    
    
    cards.innerHTML += `<div class="xl:w-1/4 md:w-1/2 p-4">
                            <div class="rounded-xl w-64">
                                <a onclick="getMovieDetails(${item.id})">
                                    <img class="h-full w-64 mx-auto rounded object-cover object-center mb-6" src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="content">
                                </a>
                                <h2 class="h-14 text-lg text-white font-medium title-font mb-4">${item.title ? item.title : item.name}</h2>
                                <button onclick="test(${item.id})" class="favoriteBtn w-10 flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-900 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                                    ${containsObject(item, oldFavorites) ? `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>` : `<i class="fas fa-heart mx-auto"></i>`}
                                </button>
                            </div>
                        </div>`
    
}

function showHorrorMovies(item){
    let cards;
    if(window.location.href.indexOf("index.html") > -1){
        cards = document.querySelector('.horror-cards')
    }else if(window.location.href.indexOf("horror.html") > -1){
        cards = document.querySelector('.horror-page-cards')
    }
        
    cards.innerHTML += `<div class="xl:w-1/4 md:w-1/2 p-4">
                            <div class="rounded-xl w-64">
                                <a onclick="getMovieDetails(${item.id})">
                                    <img class="h-full w-64 mx-auto rounded object-cover object-center mb-6" src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="content">
                                </a>
                                <h2 class="h-14 text-lg text-white font-medium title-font mb-4">${item.title ? item.title : item.name}</h2>
                                <button onclick="test(${item.id})" class="favoriteBtn w-10 flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-900 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                                    ${containsObject(item, oldFavorites) ? `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>` : `<i class="fas fa-heart mx-auto"></i>`}
                                </button>
                            </div>
                        </div>`
    
}

function showCustomMovies(item){
    const cards = document.querySelector('.search-results')
    
    cards.innerHTML += `<div class="xl:w-1/4 md:w-1/2 p-4 mt-10">
                            <div class="rounded-xl w-64">
                                <a onclick="getMovieDetails(${item.id})">
                                    <img class="h-full w-64 mx-auto rounded object-cover object-center mb-6" src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="content">
                                </a>
                                <h2 class="h-14 text-lg text-white font-medium title-font mb-4">${item.title ? item.title : item.name}</h2>
                                <button onclick="test(${item.id})" class="favoriteBtn w-10 flex items-center px-2 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-blue-900 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-300 focus:ring-opacity-80">
                                    ${containsObject(item, oldFavorites) ? `<i class="fas fa-heart mx-auto" style="color: Tomato"></i>` : `<i class="fas fa-heart mx-auto"></i>`}
                                </button>
                            </div>
                        </div>`
    
}


// helper
function containsObject(obj, list) {
    if(list == null){
        return false
    }
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
            return true;
        }
    }

    return false;
}

function positionOfObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
            return i;
        }
    }

    return false;
}