let currentsong = new Audio();
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUl = document.querySelector(".songlist ul");
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>prabh</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div> 
            </li>`;
    }

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });
    return songs
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;

    if (!pause) {
        currentsong.play();
        document.querySelector("#p").src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";


};

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //   get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="25" height="25" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src='/songs/${folder}/cover.jpg' alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        console.log(e)
        e.addEventListener("click", async item => {
            console.log("fetching")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })

    })

}



async function main() {
    await getsongs("songs/new");
    playMusic(songs[0], true);

    // display all the albums on the page
    displayalbums()

}

document.querySelector("#p").addEventListener("click", () => {
    if (currentsong.paused) {
        currentsong.play();
        document.querySelector("#p").src = "pause.svg";
    } else {
        currentsong.pause();
        document.querySelector("#p").src = "play.svg";
    }
});

currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
        `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
});

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});

document.querySelector("#pr").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
    }
});

document.querySelector("#nx").addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
    } else {
        playMusic(songs[0]);
    }
});

document.querySelector(".range input").addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
});

// add event listener to mute the track
document.querySelector(".volume>img").addEventListener("click", (e) => {
    // console.log(e.traget.src)
    if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentsong.volume = 0
    }
    else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentsong.volume = 1
    }

}
)



main();
