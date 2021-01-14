/*********************
 * 把加载当个图片当做一个promise，然后所有promise组成一个数组，存到Promise.all
 *********************/
function loadStatic(arr){
    let promises = [];
    for(let i=0;i<arr.length;i++){
        let promise = new Promise(function(resolve,reject){
            let img = new Image();
            img.src = arr[i];
            img.onload = function(){
                resolve(img);
            };
        });
        promises.push(promise);
    }
    return Promise.all(promises);
}

/*********************
 * 播放背景音乐
 *********************/
function musicBg(){
    let music = document.querySelector('#music');
    let musicAudio = music.querySelector('audio');
    let fireSoundAudios = document.querySelectorAll('#fireSound audio');
    musicAudio.volume = 0.2; // 设置背景音乐音量
    // 点击右上角播放icon的事件
    music.addEventListener('click',function(){
        if(musicAudio.paused){ // 背景音乐是暂停状态，就让其播放
            this.className = 'run';
            musicAudio.play();
            for(let i=0;i<fireSoundAudios.length;i++){
                fireSoundAudios[i].play();
                fireSoundAudios[i].muted = true; // 爆炸声静音
                fireSoundAudios[i].currentTime = i;
            }
        } else{  // 背景音乐是播放状态，就让其暂停
            this.className = '';
            musicAudio.pause();
            for(let i=0;i<fireSoundAudios.length;i++){
                fireSoundAudios[i].pause();
            }
        }
    });
}

/*********************
 * 计时器，第1页的秒往上加到9为止，然后第1页消失，第2页出现
 *********************/
function countDown(){
    let countNumber = document.querySelector('.page1-frame span');
    let page1 = document.querySelector('#page1');
    let page2 = document.querySelector('#page2');
    let timer = setInterval(()=>{
        if(countNumber.innerHTML == 9){
            clearInterval(timer);
            page1.style.display = 'none';
            page2.style.display = 'block';
            initFires();
        }
        else{
            countNumber.innerHTML = ++countNumber.innerHTML;
        }
    },1000);
}

/*********************
 * 第2页的效果
 *********************/
function initFires() {
    let page3 = document.querySelector('#page3');
    let canvas = document.querySelector('#page2 canvas');
    let ctx = canvas.getContext('2d');
    let fireSoundAudios = document.querySelectorAll('#fireSound audio');
    let width = window.innerWidth;
    let height = window.innerHeight;
}

/*********************
 * 预加载资源
 *********************/
loadStatic([
    './img/page2_text1.png',
    './img/page2_text2.png',
    './img/page2_text3.png',
    './img/page2_text4.png',
    './img/page2_text5.png',
    './img/page2_text6.png'
]).then((statics)=>{  // 图片全部加载完成回调 statics 是几个图片资源的<img>对象
    musicBg(); // 播放背景音乐
    countDown(); // 
});