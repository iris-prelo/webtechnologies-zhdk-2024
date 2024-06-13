const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "5bQPvhuVFXqDdDnNNeOg9C";
const container = document.querySelector('div[data-js="tracks"]');

let currentTrackPreviewUrl = null;
let audioElement = new Audio();
let selectedTrack = null;

function fetchPlaylist(token, playlistId) {
  fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.tracks && data.tracks.items) {
        addTracksToPage(data.tracks.items);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addTracksToPage(tracks) {
  const ul = document.createElement("ul");

  tracks.forEach((track) => {
    const li = document.createElement("li");
    li.classList.add("track-item");

    li.innerHTML = `
      <img src="${track.track.album.images[0].url}" alt="${track.track.album.name}">
      <div class="track-details">
        <span class="track-name">${track.track.name}</span>
        <span class="album-name">${track.track.album.name}</span>
        <span class="artist-name" style="display: none;">${track.track.artists.map(artist => artist.name).join(', ')}</span>
      </div>
    `;

    li.addEventListener("click", () => {
      selectTrack(li, track.track);
    });

    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function displayTrackDetails(track) {
  document.querySelector(".album-cover").src = track.album.images[0].url;
  document.querySelector(".song-name").textContent = track.name;
  document.querySelector(".artist-name").textContent = track.artists.map(artist => artist.name).join(', ');
  currentTrackPreviewUrl = track.preview_url;

  if (currentTrackPreviewUrl) {
    audioElement.src = currentTrackPreviewUrl;
    audioElement.play();
  } else {
    audioElement.pause();
  }
}
function togglePlayPause() {
  if (audioElement.paused) {
    audioElement.play();
  } else {
    audioElement.pause();
  }
  updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
  const playPauseIcon = document.getElementById('play-pause-icon');
  if (audioElement.paused) {
    playPauseIcon.src = 'images/play-button.png';
  } else {
    playPauseIcon.src = 'images/pause-button.png';
  }
}

function selectTrack(trackElement, track) {
  if (selectedTrack) {
    selectedTrack.classList.remove('selected');
  }
  trackElement.classList.add('selected');
  selectedTrack = trackElement;
  displayTrackDetails(track);
}

function fetchAccessToken() {
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access_token) {
        fetchPlaylist(data.access_token, PLAYLIST_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

document.querySelector('.play-bar-item-button').addEventListener('click', togglePlayPause);
fetchAccessToken();
