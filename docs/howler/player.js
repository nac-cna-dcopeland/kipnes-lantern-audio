

/*!
 *  Howler.js Audio Player Demo
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

// Cache references to DOM elements.
var elms = ['track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress', 'bar', 'wave', 'loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn'];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;

  // Display the title of the first track.
  track.innerHTML = playlist[0].title;

  // Setup the playlist display.
  playlist.forEach(function(song) {
    var div = document.createElement('div');
    div.className = 'list-song';
    div.innerHTML = song.title;
    div.onclick = function() {
      player.skipTo(playlist.indexOf(song));
    };
    list.appendChild(div);
  });
};
Player.prototype = {
  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function(index) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: ['./audio/' + data.file + '.mp3'],
        loop: false,
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: function() {
          // Display the duration.
          duration.innerHTML = self.formatTime(Math.round(sound.duration()));

          // Start updating the progress of the track.
          requestAnimationFrame(self.step.bind(self));

          // Start the wave animation if we have already loaded
          wave.container.style.display = 'block';
          bar.style.display = 'none';
          pauseBtn.style.display = 'block';
          // if(self.firstRun){
          //   sound.pause();
          // }
          // self.firstRun = false;
        },
        onload: function() {
          // Start the wave animation.
          wave.container.style.display = 'block';
          bar.style.display = 'none';
          loading.style.display = 'none';
        },
        onend: function() {
          // Stop the wave animation.
          wave.container.style.display = 'none';
          bar.style.display = 'block';
          //self.skip('next');
        },
        onpause: function() {
          // Stop the wave animation.
          wave.container.style.display = 'none';
          bar.style.display = 'block';
        },
        onstop: function() {
          // Stop the wave animation.
          wave.container.style.display = 'none';
          bar.style.display = 'block';
        },
        onseek: function() {
          // Start updating the progress of the track.
          requestAnimationFrame(self.step.bind(self));
        },
        onplayerror: function() {
          sound.once('unlock', function() {
            sound.play();
          });
        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    track.innerHTML = data.title;

    // Show the pause button.
    if (sound.state() === 'loaded') {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'block';
    } else {
      loading.style.display = 'block';
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'none';
    }

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
  },

  /**
   * Skip to the next or previous track.
   * @param  {String} direction 'next' or 'prev'.
   */
  skip: function(direction) {
    var self = this;

    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev') {
      index = self.index - 1;
      if (index < 0) {
        index = self.playlist.length - 1;
      }
    } else {
      index = self.index + 1;
      if (index >= self.playlist.length) {
        index = 0;
      }
    }

    self.skipTo(index);
  },

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Reset progress.
    progress.style.width = '0%';

    // Play the new track.
    self.play(index);
  },

  /**
   * Set the volume and update the volume slider display.
   * @param  {Number} val Volume between 0 and 1.
   */
  volume: function(val) {
    var self = this;

    // Update the global volume (affecting all Howls).
    Howler.volume(val);

    // Update the display on the slider.
    var barWidth = (val * 90) / 100;
    barFull.style.width = (barWidth * 100) + '%';
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} per Percentage through the song to skip.
   */
  seekPercent: function(per) {
    var self = this;
    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Convert the percent into a seek position.
    if (sound.playing()) {
      sound.seek(sound.duration() * per);
    }
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} seconds through the song to skip.
   */
  seekSeconds: function(secs) {
    var self = this;
    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // seek to position.
    if (sound.playing()) {
      sound.seek(secs);
    } else {
      console.log("Sound is not playing");
    }
  },

  /**
   * Seek to a new position in the currently playing track.
   * @param  {Number} seconds through the song to skip.
   */
  getSeek: function() {
    var self = this;
    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // get position.
    if (sound.playing()) {
      return self.formatTime(Math.round(sound.seek()));
    }
  },

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  step: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Determine our current seek position.
    var seek = sound.seek() || 0;
    timer.innerHTML = self.formatTime(Math.round(seek));
    progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(self.step.bind(self));
    }
  },

  /**
   * Toggle the playlist display on/off.
   */
  togglePlaylist: function() {
    var self = this;
    var display = (playlist.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      playlist.style.display = display;
    }, (display === 'block') ? 0 : 500);
    playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
  },

  /**
   * Toggle the volume display on/off.
   */
  toggleVolume: function() {
    var self = this;
    var display = (volume.style.display === 'block') ? 'none' : 'block';

    setTimeout(function() {
      volume.style.display = display;
    }, (display === 'block') ? 0 : 500);
    volume.className = (display === 'block') ? 'fadein' : 'fadeout';
  },

  /**
   * Format the time from seconds to M:SS.
   * @param  {Number} secs Seconds to format.
   * @return {String}      Formatted time.
   */
  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }
};

// Setup our new audio player class and pass it the playlist.
var player = new Player([
  {
    title: 'VideoVirus',
    file: 'Videovirus_TO_audio',
    howl: null
  }
]);

// Bind our player controls.
playBtn.addEventListener('click', function() {
  //player.play();
});
pauseBtn.addEventListener('click', function() {
  player.pause();
});
prevBtn.addEventListener('click', function() {
  player.skip('prev');
});
nextBtn.addEventListener('click', function() {
  player.skip('next');
});
waveform.addEventListener('click', function(event) {
  //player.#seekPercent(event.clientX / window.innerWidth);
});
playlistBtn.addEventListener('click', function() {
  player.togglePlaylist();
});
playlist.addEventListener('click', function() {
  player.togglePlaylist();
});
volumeBtn.addEventListener('click', function() {
  player.toggleVolume();
});
volume.addEventListener('click', function() {
  player.toggleVolume();
});

// Setup the event listeners to enable dragging of volume slider.
barEmpty.addEventListener('click', function(event) {
  var per = event.layerX / parseFloat(barEmpty.scrollWidth);
  player.volume(per);
});
sliderBtn.addEventListener('mousedown', function() {
  window.sliderDown = true;
});
sliderBtn.addEventListener('touchstart', function() {
  window.sliderDown = true;
});
volume.addEventListener('mouseup', function() {
  window.sliderDown = false;
});
volume.addEventListener('touchend', function() {
  window.sliderDown = false;
});

var move = function(event) {
  if (window.sliderDown) {
    var x = event.clientX || event.touches[0].clientX;
    var startX = window.innerWidth * 0.05;
    var layerX = x - startX;
    var per = Math.min(1, Math.max(0, layerX / parseFloat(barEmpty.scrollWidth)));
    player.volume(per);
  }
};

volume.addEventListener('mousemove', move);
volume.addEventListener('touchmove', move);

// Setup the "waveform" animation.
var wave = new SiriWave({
  container: waveform,
  width: window.innerWidth,
  height: window.innerHeight * 0.3,
  cover: true,
  speed: 0.03,
  amplitude: 0.7,
  frequency: 2
});
wave.start();

// Update the height of the wave animation.
// These are basically some hacks to get SiriWave.js to do what we want.
var resize = function() {
  var height = window.innerHeight * 0.3;
  var width = window.innerWidth;
  wave.height = height;
  wave.height_2 = height / 2;
  wave.MAX = wave.height_2 - 4;
  wave.width = width;
  wave.width_2 = width / 2;
  wave.width_4 = width / 4;
  wave.canvas.height = height;
  wave.canvas.width = width;
  wave.container.style.margin = -(height / 2) + 'px auto';

  // Update the position of the slider.
  var sound = player.playlist[player.index].howl;
  if (sound) {
    var vol = sound.volume();
    var barWidth = (vol * 0.9);
    sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
  }
};

var vvShowTimeStart = function(currentTime,startTime) {
  // var currentTime = new Date().getTime();
  // var today = new Date();
  // var ss = String(today.getSeconds()).padStart(2, '0');
  // var mn = String(today.getMinutes()).padStart(2, '0');
  // var hh = String(today.getHours()).padStart(2, '0');
  // var dd = String(today.getDate()).padStart(2, '0');
  // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  // var yyyy = today.getFullYear();
  // 
  // today = mm + '/' + dd + '/' + yyyy;
  // var startTime = new Date(today + " " + ss + " 09:36:00 AM").getTime();
  
  //subtractMilliSecondsValue = timeIsBeing936 - currentTime;
  //   setTimeout(timeToAlert, subtractMilliSecondsValue);
  //console.log("It's the start of the minute!");
  console.log("It's the start of the minute!");
  document.getElementById("playBtn").click();
};
var vvShowTimeCheck = function() {
  // var currentTime = new Date().getTime();
  // var today = new Date();
  // var ss = String(today.getSeconds()).padStart(2, '0');
  // var mn = String(today.getMinutes()).padStart(2, '0');
  // var hh = String(today.getHours()).padStart(2, '0');
  // var dd = String(today.getDate()).padStart(2, '0');
  // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  // var yyyy = today.getFullYear();
  // 
  // today = mm + '/' + dd + '/' + yyyy;
  // var startTime = new Date(today + " " + ss + " 09:36:00 AM").getTime();
  
  //subtractMilliSecondsValue = timeIsBeing936 - currentTime;
  //   setTimeout(timeToAlert, subtractMilliSecondsValue);
  var currentTime = moment();
  var startTime = moment().endOf("minute");
  //duration = moment.duration(duration - interval, 'milliseconds');

};
window.addEventListener('resize', resize);
resize();
//vvShowTimeCheck();

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

$('document').ready(function(){

  var currentlyPlaying = function(currentTime,vvDuration){
    var endOfVideo = moment().startOf("hour").add(vvDuration,"seconds");

    // for testing - video is ALWAYS playing
    //var endOfVideo = moment().add(vvDuration,"seconds");

    //console.log(endOfVideo);
    if(currentTime < endOfVideo){
      console.log("Video is currently playing!");
      return true;
    }
    return false;
  };

  // Check showtime once user interacts with the page.
  document.querySelector('#playBtn').addEventListener('click', function() {
    player.firstRun = true;
    //player.play();
    //player.pause();
    var currentTime = moment(),
    startTime,
    vvDuration = 180;
    //vvDuration = 20;
  
    if(!getUrlParameter('offset')){
      if(currentlyPlaying(currentTime,vvDuration)){
        console.log("User has clicked play but it's already started...");
        //$('#myModal').modal();
        
        player.volume(0);
        player.play();

        setTimeout(
          function() 
            {
              player.seekSeconds((moment().minute()*60) + moment().second());
            },
        100);

        player.volume(1);
        //console.log((moment().minute()*60) + moment().second());
        //player.seekSeconds(20);
        document.querySelector('#pauseBtn').classList.add("d-none");
        console.log('Playback resumed successfully with calculated offset');
      } else {
  
        console.log("User has clicked play but it's not showtime yet...");
        //$('#myModal').modal();
        var timePoll = setInterval(function(){
          var currentTime = moment(),
          startTime = moment().endOf("hour");
      
          if(currentTime > startTime){
            clearInterval(timePoll);
            //vvShowTimeCheck();
            //context.resume().then(() => {
              //$('#myModal').modal('hide');
              player.play();
              document.querySelector('#pauseBtn').classList.add("d-none");
              console.log('Playback began successfully on the hour');
            //});
          } else {
            console.log(startTime.diff(currentTime,'seconds') + " seconds until audio");
          }
        }, 250);
      }
    } else {
      //$('#myModal').modal();
      var timeOffset = getUrlParameter('offset');
      startTime = moment().add(timeOffset,"seconds");
        var timePoll = setInterval(function(){
          var currentTime = moment();
      
          if(currentTime > startTime){
            clearInterval(timePoll);
            //vvShowTimeCheck();
            //context.resume().then(() => {
              //$('#myModal').modal('hide');
              player.play();
              document.querySelector('#pauseBtn').classList.add("d-none");
              console.log('Playback resumed successfully after offset');
            //});
          } else {
            console.log(startTime.diff(currentTime,'seconds') + " seconds until audio");
          }
        }, 250);
    }
  
  });
});
