const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STOAGE_KEY = "DAYANG_PLAYER";

const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");

const player = $(".player");
const playBtn = $(".btn-toggle-play");

const progress = $(".progress");
const preBtn = $(".fa-step-backward");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STOAGE_KEY)) || {},

    songs: [
        {
            name: "红色高跟鞋",
            singer: "douyin",
            path: "./assets/MP3/红色高跟鞋.mp3",
            image: "./assets/img/img7.jpg",
        },
        {
            name: "起风了",
            singer: "douyin",
            path: "./assets/MP3/起风了.mp3",
            image: "./assets/img/img2.jpg",
        },
        {
            name: "一路生花",
            singer: "douyin",
            path: "./assets/MP3/一路生花.mp3",
            image: "./assets/img/img3.jpg",
        },
        {
            name: "和鸟飞蝉",
            singer: "douyin",
            path: "./assets/MP3/和鸟飞蝉.mp3",
            image: "./assets/img/img4.jpg",
        },
        {
            name: "天使的翅膀",
            singer: "douyin",
            path: "./assets/MP3/天使的翅膀.mp3",
            image: "./assets/img/img5.jpg",
        },
        {
            name: "我的好兄弟",
            singer: "douyin",
            path: "./assets/MP3/我的好兄弟.mp3",
            image: "./assets/img/img6.jpg",
        },
    ],
    defineProperties: function () {
        Object.defineProperty(this, "curentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.getItem(PLAYER_STOAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
      <div class="song ${
          index === this.currentIndex ? "active" : ""
      }" data-index=${index}>
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>`;
        });
        playList.innerHTML = htmls.join("");
    },

    handleEvents: function () {
        // xử lý cd quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 20000,
                iterations: Infinity,
            }
        );

        cdThumbAnimate.pause();

        const _this = this;
        // xử lý phóng to, thu nhỏ cd
        const cdWidth = cd.offsetWidth;
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // xử lý khi nhấn vào nút play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };

        // khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // khi song đang chạy thì thanh tua video cũng sẽ chạy theo tiến độ bài nhạc
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPesen = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPesen;
            }
        };

        // xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        // xử lý khi next song
        nextBtn.onclick = () => {
            if (_this.isRandom) {
                this.randomSong();
            } else {
                this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        };

        // xử lý khi pre song
        preBtn.onclick = () => {
            if (_this.isRandom) {
                this.randomSong();
            } else {
                this.preSong();
            }
            audio.play();
            _this.render();
            _this.scrollActiveSong();
        };

        // xử lý khi ấn vào nút chọn bài hát ngẫu nhiên
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // khi audio chạy đến cuối cùng, tự động chuyển tiếp
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // xử lý khi repeat
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        //  xử lý khi nhấn trực tiếp vào bài hát
        playList.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");
            if (songNode || e.target.closest(".option")) {
                if (songNode) {
                    _this.currentIndex = Number(
                        songNode.getAttribute("data-index")
                    );
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        };
    },

    loadCurrentSong: function () {
        heading.textContent = this.curentSong.name;
        cdThumb.style.backgroundImage = `url('${this.curentSong.image}')`;
        audio.src = this.curentSong.path;
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    preSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollActiveSong: function () {
        setTimeout(function () {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
            if (this.currentIndex === 0) {
                $(".song.active").scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
                console.log("this.currentIndex", this.currentIndex);
            }
            //  if(this.currentIndex = this.songs.length - 1) {
            //   $('.song.active').scrollIntoView({
            //     behavior: "smooth",
            //     block: "end"
            //    });
            //  }
        }, 300);
    },

    start: function () {
        // định nghĩa các thuộc tính, các object
        this.defineProperties();

        // lắng nghe và xử lý các sự kiện DOM event
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào ứng dụng
        this.loadCurrentSong();

        //render playlist
        this.render();

        //hiển thị trạng thái ban đầu của button repeat và
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};

app.start();
