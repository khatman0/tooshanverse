// همبرگری
const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');

if(hamburger && sideMenu){
  hamburger.addEventListener('click', ()=>{sideMenu.classList.toggle('show');});
  sideMenu.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click', ()=>{sideMenu.classList.remove('show');});
  });
  document.addEventListener('click',(e)=>{
    if(!sideMenu.contains(e.target) && e.target!==hamburger){
      sideMenu.classList.remove('show');
    }
  });
}

// بکگراند تعویضی برای دسکتاپ
const bgDiv = document.getElementById('background');
const storyItems = document.querySelectorAll('.story-item');
const stories = Array.from(storyItems).map((el,i)=>({
  el,
  img: el.dataset.image // در HTML باید story-item ها data-image داشته باشن
}));

const isMobile = window.innerWidth <= 768;
if(!isMobile){
  stories.forEach(s=>{
    s.el.addEventListener('mouseover',()=>{bgDiv.style.backgroundImage=`url('${s.img}')`;});
    s.el.addEventListener('mouseout',()=>{bgDiv.style.backgroundImage='';});
  });
} else {
  let current = 0;
  function changeBg(){
    if(stories[current]) bgDiv.style.backgroundImage=`url('${stories[current].img}')`;
    current=(current+1)%stories.length;
  }
  changeBg();
  setInterval(changeBg,5000);
}
