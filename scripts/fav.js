getFavorites();

function getFavorites(){
    let fav = JSON.parse(localStorage.getItem("favorites"));
    console.log(fav)
    fav.map(showFavorites);
}


function showFavorites(item){
    const cards = document.querySelector('.favorite-cards')
    cards.innerHTML += `<div class="xl:w-1/4 md:w-1/2 p-4 mx-auto">
    <div class="rounded-xl w-32 md:w-64 mx-auto">
        <a onclick="getMovieDetails(${item.id})">
            <img class="h-full w-32 md:w-64 mx-auto rounded object-cover object-center mb-6" src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="content">
        </a>
        <div class="flex flex-col md:flex-row space-x-4 justify-between">
            <h2 class="h-14 text-lg text-white font-medium title-font mb-4">${item.title ? item.title : item.name}</h2>
        </div>
        
    </div>
</div>`
    
}


function getMovieDetails(id){
    sessionStorage.setItem("movieID", JSON.stringify(id))
    window.location = "movie.html";
}

function showMovieDetails(){
    guest_session_id = localStorage.getItem("guest_session_id");
    axios.get(`https://api.themoviedb.org/3/guest_session/${guest_session_id}/rated/movies?api_key=9ec9eafb71ae45ba76400994a6778f89&language=en-US&sort_by=created_at.asc&page=1`)
    .then(function (response){
        rated_movies = response.data.results
        movieDetailsPage();
    })
    
}

function movieDetailsPage(){
    let movie_id = JSON.parse(sessionStorage.getItem("movieID")) 
    let item;
    axios.get(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=9ec9eafb71ae45ba76400994a6778f89&language=en-US`)
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
                    ${position !== false ? `<button onclick="addRating(${item.id})" class=" ratingBtn ml-4 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">${rated_movies[position].rating}</button>` : `<button onclick="addRating(${item.id})" class="ratingBtn ml-4 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg">Add your rating</button>`}
                    
                </div>
                </div>
            </div>
        </section>
        `
    })
}