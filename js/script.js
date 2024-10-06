console.log(`Script is Running`);
let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;
  return `${minutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let songHtml = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await songHtml.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let a = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < a.length; index++) {
    const element = a[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //Displaying the songlist on the sidebar
  let songList = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songList.innerHTML = " ";
  for (const song of songs) {
    songList.innerHTML =
      songList.innerHTML +
      `<li>
                <img class="invert" src="assets/song.svg" alt="song">
                    <div class="songInfo">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Jatin</div>
                    </div>
                    <div class="playNow flex align-items justify-content">
                        <span>Play Now</span>
                        <img class="invert" src="assets/play.svg" alt="play">
                    </div>

                </li>`;
  }

  // Attaching EventListener to every song in songList
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(
        e
          .querySelector(".songInfo")
          .getElementsByTagName("div")[0]
          .innerHTML.trim()
      );
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "assets/pause.svg";
  }
  document.querySelector(".songName").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = `00:00/00:00`;
};

async function displayAlbums() {
  let folderHtml = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await folderHtml.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let cardContainer = document.querySelector(".cardcontainer");
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `
            <div data-folder="${folder}" class="card">
              <div class="roundbox flex align-items justify-content">
                <img src="assets/playButton.svg" alt="playButton" />
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="G.O.A.T" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>
            `;
    }
  }

  //playList functionality
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  })

 
}

async function main() {
  await getSongs("songs/Jatin");
  playMusic(songs[0], true);

  //displaying all the playlists on the page
  await displayAlbums();

  //Making the music buttons working
  play.addEventListener("click", (e) => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "assets/pause.svg";
    } else {
      currentSong.pause();
      play.src = "assets/play.svg";
    }
  });

  //Time duration of the song
  currentSong.addEventListener("timeupdate", (e) => {
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currentSong.currentTime
    )}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //seekbar updation
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //adding functinality to hamburger button
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0%";
    document.getElementById("collapse").style.display = "inline-block";
  });

  //adding functionality to collapse button
  document.getElementById("collapse").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-100%";
  });

  //adding functionality to next and previous button
  next.addEventListener("click", (e) => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index === songs.length - 1) {
      playMusic(songs[0]);
    } else {
      playMusic(songs[index + 1]);
    }
  });

  previous.addEventListener("click", (e) => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index === 0) {
      playMusic(songs[songs.length - 1]);
    } else {
      playMusic(songs[index - 1]);
    }
  });

  // Adding functionality to volume button
  document.querySelector("#range").addEventListener("change", (e) => {
    let volume = e.target.value / 100;
    currentSong.volume = volume;
  });

  //mute functionality
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.getElementById("range").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 1;
      document.getElementById("range").value = 100;
    }
  });
}

main();
